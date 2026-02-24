const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Augmenter la limite pour les images base64
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI) // plus besoin des options
  .then(() => console.log("MongoDB connecté"))
  .catch((err) => console.error("Erreur MongoDB :", err));

// Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/boutique", require("./routes/boutique"));
app.use("/api/boutique/categories", require("./routes/boutique/categories"));
app.use("/api/boutique/produits", require("./routes/boutique/produits"));
app.use("/api/client", require("./routes/client"));

// Routes publiques pour le plan-centre (temporaire pour les tests)
const centreController = require("./controllers/admin/CentreController");
app.get("/api/public/centres", centreController.getAllCentres);
app.get("/api/public/centres/:id/plan", centreController.getCentreWithPlan);

// Démarrage du serveur
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
