const express = require("express");
const router = express.Router();
const { authentification, interdireAccesInterdit } = require("../../middleware/auth");
const mongoose = require("mongoose");
const Boutique = require("../../models/admin/Boutique");
const Produit = require("../../models/boutique/Produit");
const Commande = require("../../models/boutique/Commande");
const MouvementStock = require("../../models/boutique/MouvementStock");

router.use(authentification);
router.use(interdireAccesInterdit);

router.get("/", async (req, res) => {
  try {
    const boutique = await Boutique.findOne({ "contact.email": req.utilisateur.email });
    if (!boutique) return res.status(404).json({ erreur: "Boutique introuvable" });
    const idBoutique = boutique._id;
    const oid = mongoose.Types.ObjectId.createFromHexString(idBoutique.toString());
    const now = new Date();

    // --- KPIs produits ---
    const [totalProduits, produitsRuptureStock] = await Promise.all([
      Produit.countDocuments({ idBoutique }),
      Produit.countDocuments({ idBoutique, statut: "rupture_stock" }),
    ]);

    // Stock total (sum all variantes.stock.quantite)
    const stockAgg = await Produit.aggregate([
      { $match: { idBoutique: oid } },
      { $unwind: "$variantes" },
      { $group: { _id: null, total: { $sum: "$variantes.stock.quantite" } } }
    ]);
    const stockTotal = stockAgg[0]?.total || 0;

    // --- KPIs commandes ---
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
    const [totalCommandes, commandesMois] = await Promise.all([
      Commande.countDocuments({ idBoutique }),
      Commande.countDocuments({ idBoutique, createdAt: { $gte: debutMois } }),
    ]);

    const caAgg = await Commande.aggregate([
      { $match: { idBoutique: oid } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const caTotal = caAgg[0]?.total || 0;

    const caMoisAgg = await Commande.aggregate([
      { $match: { idBoutique: oid, createdAt: { $gte: debutMois } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const caMois = caMoisAgg[0]?.total || 0;

    const enAttenteAgg = await Commande.aggregate([
      { $match: { idBoutique: oid, statut: "en_attente" } },
      { $count: "count" }
    ]);
    const commandesEnAttente = enAttenteAgg[0]?.count || 0;

    // --- Commandes par statut ---
    const commandesParStatut = await Commande.aggregate([
      { $match: { idBoutique: oid } },
      { $group: { _id: "$statut", count: { $sum: 1 }, ca: { $sum: "$total" } } },
      { $sort: { count: -1 } }
    ]);

    // --- CA par mois (6 derniers mois) ---
    const debut6Mois = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const caParMois = await Commande.aggregate([
      { $match: { idBoutique: oid, createdAt: { $gte: debut6Mois } } },
      { $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        ca: { $sum: "$total" },
        count: { $sum: 1 }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // --- Commandes par jour (7 derniers jours) ---
    const debut7Jours = new Date(now);
    debut7Jours.setDate(debut7Jours.getDate() - 6);
    debut7Jours.setHours(0, 0, 0, 0);
    const commandesParJour = await Commande.aggregate([
      { $match: { idBoutique: oid, createdAt: { $gte: debut7Jours } } },
      { $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } },
        count: { $sum: 1 },
        ca: { $sum: "$total" }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    // --- Top 5 produits vendus (par quantite) ---
    const topProduits = await Commande.aggregate([
      { $match: { idBoutique: oid } },
      { $unwind: "$lignes" },
      { $group: {
        _id: "$lignes.idProduit",
        nom: { $first: "$lignes.nomProduit" },
        quantite: { $sum: "$lignes.quantite" },
        ca: { $sum: "$lignes.sousTotal" }
      }},
      { $sort: { quantite: -1 } },
      { $limit: 5 }
    ]);

    // --- Mouvements stock par jour (30 derniers jours) ---
    const debut30Jours = new Date(now);
    debut30Jours.setDate(debut30Jours.getDate() - 29);
    debut30Jours.setHours(0, 0, 0, 0);
    const mouvementsParJour = await MouvementStock.aggregate([
      { $match: { idBoutique: oid, dateCreation: { $gte: debut30Jours } } },
      { $group: {
        _id: {
          year: { $year: "$dateCreation" },
          month: { $month: "$dateCreation" },
          day: { $dayOfMonth: "$dateCreation" },
          type: "$type"
        },
        total: { $sum: "$quantite" }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    res.json({
      kpis: { totalProduits, produitsRuptureStock, stockTotal, totalCommandes, commandesMois, caTotal, caMois, commandesEnAttente },
      commandesParStatut,
      caParMois,
      commandesParJour,
      topProduits,
      mouvementsParJour
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ erreur: err.message });
  }
});

module.exports = router;
