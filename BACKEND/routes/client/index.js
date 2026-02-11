const express = require("express");
const router = express.Router();
const { authentification, verifierRole, interdireAccesInterdit } = require("../../middleware/auth");

// Appliquer l'authentification et vérification du rôle client ou admin ou boutique à toutes les routes
router.use(authentification);
router.use(interdireAccesInterdit); // Empêche les autres rôles d'accéder à cette zone
router.use((req, res, next) => {
  if (!req.utilisateur) {
    return res.status(401).json({
      erreur: "Accès refusé. Utilisateur non authentifié.",
    });
  }

  // Autoriser les rôles admin et boutique à accéder à l'espace client
  if (req.utilisateur.role === "client" || req.utilisateur.role === "admin" || req.utilisateur.role === "boutique") {
    next();
  } else {
    return res.status(403).json({
      erreur: "Accès refusé. Permissions insuffisantes.",
    });
  }
});

// Ajouter ici les routes spécifiques au client
// Exemple: router.use("/mes-reservations", require("./mes-reservations"));

router.get("/", (req, res) => {
  res.json({ message: "Accès client autorisé", utilisateur: req.utilisateur });
});

module.exports = router;