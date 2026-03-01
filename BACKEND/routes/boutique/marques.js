const express = require("express");
const router = express.Router();
const { authentification, interdireAccesInterdit } = require("../../middleware/auth");
const marqueController = require("../../controllers/boutique/MarqueController");

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

// Routes pour les marques
router.get("/", (req, res) => marqueController.obtenirToutesMarques(req, res));
router.get("/slug/:slug", (req, res) => marqueController.obtenirMarqueParSlug(req, res));
router.get("/recherche", (req, res) => marqueController.rechercherMarques(req, res));
router.get("/:id", (req, res) => marqueController.obtenirMarqueParId(req, res));
router.post("/", (req, res) => marqueController.creerMarque(req, res));
router.put("/:id", (req, res) => marqueController.mettreAJourMarque(req, res));
router.delete("/:id", (req, res) => marqueController.supprimerMarque(req, res));

module.exports = router;
