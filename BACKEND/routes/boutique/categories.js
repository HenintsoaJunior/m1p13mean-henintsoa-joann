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
router.post("/", categorieController.creerCategorie.bind(categorieController));
router.get("/", categorieController.obtenirListeCategories.bind(categorieController));
router.get("/boutique", categorieController.obtenirCategoriesParBoutique.bind(categorieController));
router.get("/arbre", categorieController.obtenirArbreCategories.bind(categorieController));
router.get("/hierarchie", categorieController.obtenirCategoriesAvecHierarchie.bind(categorieController));
router.get("/slug/:slug", categorieController.obtenirCategorieParSlug.bind(categorieController));
router.get("/:id", categorieController.obtenirCategorieParId.bind(categorieController));
router.get("/parent/:idParent/enfants", categorieController.obtenirCategoriesEnfants.bind(categorieController));
router.put("/:id", categorieController.mettreAJourCategorie.bind(categorieController));
router.delete("/:id", categorieController.supprimerCategorie.bind(categorieController));

module.exports = router;
