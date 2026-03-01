const express = require("express");
const router = express.Router();
const { authentification, interdireAccesInterdit } = require("../../middleware/auth");
const couleurController = require("../../controllers/boutique/CouleurController");

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

// Routes pour les couleurs
router.get("/", (req, res) => couleurController.obtenirToutesCouleurs(req, res));
router.get("/recherche", (req, res) => couleurController.rechercherCouleurs(req, res));
router.get("/:id", (req, res) => couleurController.obtenirCouleurParId(req, res));
router.post("/", (req, res) => couleurController.creerCouleur(req, res));
router.put("/:id", (req, res) => couleurController.mettreAJourCouleur(req, res));
router.delete("/:id", (req, res) => couleurController.supprimerCouleur(req, res));

module.exports = router;
