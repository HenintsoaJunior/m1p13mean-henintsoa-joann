const express = require("express");
const router = express.Router();
const { authentification, verifierRole, interdireAccesInterdit } = require("../../middleware/auth");

// Appliquer l'authentification et vérification du rôle boutique à toutes les routes
router.use(authentification);
router.use(interdireAccesInterdit); // Empêche les autres rôles d'accéder à cette zone
router.use(verifierRole("boutique"));

// Ajouter ici les routes spécifiques à la boutique
// Exemple: router.use("/mes-emplacements", require("./mes-emplacements"));

router.get("/", (req, res) => {
  res.json({ message: "Accès boutique autorisé", utilisateur: req.utilisateur });
});

module.exports = router;