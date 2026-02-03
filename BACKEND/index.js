const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI) // plus besoin des options
  .then(() => console.log("MongoDB connecté"))
  .catch((err) => console.error("Erreur MongoDB :", err));

// Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/admin"));

// Routes publiques pour le plan-centre (temporaire pour les tests)
const centreController = require("./controllers/admin/CentreController");
app.get("/api/public/centres", centreController.getAllCentres);
app.get("/api/public/centres/:id/plan", centreController.getCentreWithPlan);

// Démarrage du serveur
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
