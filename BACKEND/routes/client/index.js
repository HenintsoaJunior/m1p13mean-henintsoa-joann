const express = require("express");
const router = express.Router();
const { authentification, verifierRole, interdireAccesInterdit } = require("../../middleware/auth");

// Appliquer l'authentification et vérification du rôle client à toutes les routes
router.use(authentification);
router.use(interdireAccesInterdit); // Empêche les autres rôles d'accéder à cette zone
router.use(verifierRole("client"));

// Ajouter ici les routes spécifiques au client
// Exemple: router.use("/mes-reservations", require("./mes-reservations"));

router.get("/", (req, res) => {
  res.json({ message: "Accès client autorisé", utilisateur: req.utilisateur });
});

module.exports = router;