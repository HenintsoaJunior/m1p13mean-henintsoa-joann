const express = require("express");
const router = express.Router();
const { authentification, verifierRole, interdireAccesInterdit } = require("../../middleware/auth");

// Appliquer l'authentification et vérification du rôle boutique ou admin à toutes les routes
router.use(authentification);
router.use(interdireAccesInterdit); // Empêche les autres rôles d'accéder à cette zone
router.use((req, res, next) => {
  if (!req.utilisateur) {
    return res.status(401).json({
      erreur: "Accès refusé. Utilisateur non authentifié.",
    });
  }

  // Autoriser les rôles admin et boutique à accéder à l'espace boutique
  if (req.utilisateur.role === "boutique" || req.utilisateur.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      erreur: "Accès refusé. Permissions insuffisantes.",
    });
  }
});

// Ajouter ici les routes spécifiques à la boutique
// Exemple: router.use("/mes-emplacements", require("./mes-emplacements"));

router.get("/", (req, res) => {
  res.json({ message: "Accès boutique autorisé", utilisateur: req.utilisateur });
});

module.exports = router;