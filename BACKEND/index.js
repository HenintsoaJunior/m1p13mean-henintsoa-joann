const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Vérifier les variables d'environnement
if (!process.env.MONGO_URI) {
  console.error(
    "ERREUR: MONGO_URI n'est pas défini dans les variables d'environnement",
  );
}

// Connexion à MongoDB (seulement si MONGO_URI est défini)
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connecté"))
    .catch((err) => console.error("❌ Erreur MongoDB :", err.message));
} else {
  console.warn("⚠️  MongoDB non connecté - MONGO_URI manquant");
}

// Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/boutique", require("./routes/boutique"));
app.use("/api/boutique/categories", require("./routes/boutique/categories"));
app.use("/api/boutique/produits", require("./routes/boutique/produits"));
app.use("/api/client", require("./routes/client"));
// Routes pour les réponses aux appels d'offre (création par boutiques, actions admin)
app.use("/api/reponses-appel-offre", require("./routes/reponsesAppelOffre"));

// Routes publiques pour le plan-centre
const centreController = require("./controllers/admin/CentreController");
app.get("/api/public/centres", centreController.getAllCentres);
app.get("/api/public/centres/:id/plan", centreController.getCentreWithPlan);

// Route publique pour l'arbre des catégories
const categorieController = require("./controllers/boutique/CategorieController");
app.get("/api/public/categories/arbre", (req, res) => categorieController.obtenirArbreCategories(req, res));

// Routes publiques pour les appels d'offre (clients peuvent voir les appels ouverts)
const AppelOffre = require("./models/admin/AppelOffre");
const Emplacement = require("./models/admin/Emplacement");

app.get("/api/public/appels-offre", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter: only open appels d'offre
    const filters = { statut: "ouvert" };

    // Build query and populate emplacement details
    const appelsOffre = await AppelOffre.find(filters)
      .populate({
        path: "emplacement_id",
        model: "Emplacement",
        select: "_id nom code surface_m2 loyer_mensuel type statut",
        populate: {
          path: "etage_id",
          model: "Etage",
          select: "_id nom niveau surface_totale_m2 hauteur_sous_plafond_m",
          populate: {
            path: "batiment_id",
            model: "Batiment",
            select: "_id nom description",
            populate: {
              path: "centre_id",
              model: "Centre",
              select: "_id nom adresse description"
            }
          }
        }
      })
      .sort({ date_appel: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Reformat appels to use 'emplacement' instead of 'emplacement_id'
    const formattedAppels = appelsOffre.map((appel) => ({
      ...appel,
      emplacement: appel.emplacement_id,
      emplacement_id: undefined,
    }));

    const total = await AppelOffre.countDocuments(filters);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        appelsOffre: formattedAppels,
        pagination: {
          page,
          limit,
          total,
          pages: totalPages,
        },
      },
    });
  } catch (error) {
    console.error("Erreur appels publics:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/public/appels-offre/:id", async (req, res) => {
  try {
    const appel = await AppelOffre.findOne({
      _id: req.params.id,
      statut: "ouvert", // Only allow viewing open appels
    })
      .populate({
        path: "emplacement_id",
        model: "Emplacement",
        select: "_id nom code surface_m2 loyer_mensuel type statut",
        populate: {
          path: "etage_id",
          model: "Etage",
          select: "_id nom niveau surface_totale_m2 hauteur_sous_plafond_m",
          populate: {
            path: "batiment_id",
            model: "Batiment",
            select: "_id nom description",
            populate: {
              path: "centre_id",
              model: "Centre",
              select: "_id nom adresse description"
            }
          }
        }
      })
      .lean();

    if (!appel) {
      return res.status(404).json({
        success: false,
        message: "Appel d'offre non trouvé ou fermé",
      });
    }

    // Reformat appel to use 'emplacement' instead of 'emplacement_id'
    const formattedAppel = {
      ...appel,
      emplacement: appel.emplacement_id,
      emplacement_id: undefined,
    };

    res.status(200).json({ success: true, data: formattedAppel });
  } catch (error) {
    console.error("Erreur appel public:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Public products endpoint
const Produit = require("./models/boutique/Produit");

app.get("/api/public/produits", async (req, res) => {
  try {
    const { categorie, q, page = 1, limit = 20, promo } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { statut: "actif" };
    if (categorie) {
      const cats = categorie.split(',').map(c => c.trim()).filter(Boolean);
      filter.idCategorie = cats.length === 1 ? cats[0] : { $in: cats };
    }
    if (q) filter.$or = [
      { nom: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } }
    ];

    let [produits, total] = await Promise.all([
      Produit.find(filter)
        .populate("idCategorie", "nom slug")
        .populate("idBoutique", "contact statut")
        .sort({ dateCreation: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Produit.countDocuments(filter)
    ]);

    // join promotions and optionally filter
    const PromotionService = require("./services/boutique/PromotionService");
    const promoService = new PromotionService();
    produits = await promoService.annoterProduits(produits.map(p => p));

    const withPromo = produits.filter(p => p.promotion);
    console.log(`[PROMO DEBUG] Total produits: ${produits.length}, avec promotion: ${withPromo.length}`);
    if (withPromo.length > 0) {
      console.log('[PROMO DEBUG] Exemple promo:', JSON.stringify(withPromo[0].promotion, null, 2));
    }

    if (promo === 'true' || promo === '1' || promo === true) {
      produits = produits.filter(p => p.promotion);
      total = produits.length;
    }

    res.json({ success: true, produits, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ IMPORTANT : Ne démarre le serveur qu'en local
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
}

// ✅ Export obligatoire pour Vercel
module.exports = app;
