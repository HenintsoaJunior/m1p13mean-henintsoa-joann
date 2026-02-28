const express = require("express");
const router = express.Router();
const { authentification, interdireAccesInterdit } = require("../../middleware/auth");
const typeUniteController = require("../../controllers/boutique/TypeUniteController");

// Appliquer l'authentification et la vérification d'accès à toutes les routes
router.use(authentification);
router.use(interdireAccesInterdit);

// Vérifier que l'utilisateur est de type boutique ou admin
router.use((req, res, next) => {
  if (!req.utilisateur) {
    return res.status(401).json({
      erreur: "Accès refusé. Utilisateur non authentifié.",
    });
  }

  if (req.utilisateur.role === "boutique" || req.utilisateur.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      erreur: "Accès refusé. Permissions insuffisantes.",
    });
  }
});

// Routes pour les types d'unités
router.get("/", (req, res) => typeUniteController.obtenirTousTypesUnites(req, res));
router.get("/:id", (req, res) => typeUniteController.obtenirTypeUniteParId(req, res));
router.post("/", (req, res) => typeUniteController.creerTypeUnite(req, res));
router.put("/:id", (req, res) => typeUniteController.mettreAJourTypeUnite(req, res));
router.delete("/:id", (req, res) => typeUniteController.supprimerTypeUnite(req, res));

// Routes pour gérer les valeurs des types d'unités
router.post("/:id/valeurs", (req, res) => typeUniteController.ajouterValeur(req, res));
router.delete("/:id/valeurs/:valeur", (req, res) => typeUniteController.supprimerValeur(req, res));

module.exports = router;
