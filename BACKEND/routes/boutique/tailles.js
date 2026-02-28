const express = require("express");
const router = express.Router();
const { authentification, interdireAccesInterdit } = require("../../middleware/auth");
const tailleController = require("../../controllers/boutique/TailleController");

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

// Routes pour les tailles
router.get("/", (req, res) => tailleController.obtenirToutesTailles(req, res));
router.get("/standards", (req, res) => tailleController.obtenirTaillesStandards(req, res));
router.get("/type/:idTypeUnite", (req, res) => tailleController.obtenirTaillesParTypeUnite(req, res));
router.get("/recherche", (req, res) => tailleController.rechercherTailles(req, res));
router.get("/:id", (req, res) => tailleController.obtenirTailleParId(req, res));
router.post("/", (req, res) => tailleController.creerTaille(req, res));
router.put("/:id", (req, res) => tailleController.mettreAJourTaille(req, res));
router.delete("/:id", (req, res) => tailleController.supprimerTaille(req, res));

module.exports = router;
