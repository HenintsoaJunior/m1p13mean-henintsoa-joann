const express = require("express");
const router = express.Router();

// Routes spécifiques à la boutique
// Chaque fichier de route gère sa propre authentification
router.use("/produits", require("./produits"));
router.use("/categories", require("./categories"));

// Routes pour les attributs de produits
router.use("/couleurs", require("./couleurs"));
router.use("/tailles", require("./tailles"));
router.use("/marques", require("./marques"));
router.use("/types-unites", require("./types-unites"));

// Gestion de stock
router.use("/mouvements-stock", require("./mouvements-stock"));

// Gestion des commandes
router.use("/commandes", require("./commandes"));

router.get("/", (req, res) => {
  res.json({ message: "Espace boutique - API disponible" });
});

module.exports = router;
