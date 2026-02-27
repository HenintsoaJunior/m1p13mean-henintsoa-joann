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
  console.error("ERREUR: MONGO_URI n'est pas défini dans les variables d'environnement");
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

// ✅ IMPORTANT : Ne démarre le serveur qu'en local
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
}

// ✅ Export obligatoire pour Vercel
module.exports = app;
