const express = require("express");
const router = express.Router();
const { authentification, interdireAccesInterdit } = require("../../middleware/auth");
const categorieController = require("../../controllers/boutique/CategorieController");

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

// Routes pour les catégories
router.post("/", (req, res) => categorieController.creerCategorie(req, res));
router.get("/", (req, res) => categorieController.obtenirListeCategories(req, res));
router.get("/boutique", (req, res) => categorieController.obtenirCategoriesParBoutique(req, res));
router.get("/arbre", (req, res) => categorieController.obtenirArbreCategories(req, res));
router.get("/hierarchie", (req, res) => categorieController.obtenirCategoriesAvecHierarchie(req, res));
router.get("/slug/:slug", (req, res) => categorieController.obtenirCategorieParSlug(req, res));
router.get("/:id", (req, res) => categorieController.obtenirCategorieParId(req, res));
router.get("/parent/:idParent/enfants", (req, res) => categorieController.obtenirCategoriesEnfants(req, res));
router.put("/:id", (req, res) => categorieController.mettreAJourCategorie(req, res));
router.delete("/:id", (req, res) => categorieController.supprimerCategorie(req, res));

module.exports = router;
