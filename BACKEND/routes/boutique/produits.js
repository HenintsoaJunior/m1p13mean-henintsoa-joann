const express = require("express");
const router = express.Router();
const { authentification, interdireAccesInterdit } = require("../../middleware/auth");
const produitController = require("../../controllers/boutique/ProduitController");

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

// Routes pour les produits
router.post("/", produitController.creerProduit.bind(produitController));
router.get("/", produitController.obtenirListeProduits.bind(produitController));
router.get("/boutique", produitController.obtenirProduitsParBoutique.bind(produitController));
router.get("/categorie/:idCategorie", produitController.obtenirProduitsParCategorie.bind(produitController));
router.get("/statut/:statut", produitController.obtenirProduitsParStatut.bind(produitController));
router.get("/recherche", produitController.rechercherProduits.bind(produitController));
router.get("/slug/:slug", produitController.obtenirProduitParSlug.bind(produitController));
router.get("/:id", produitController.obtenirProduitParId.bind(produitController));
router.put("/:id", produitController.mettreAJourProduit.bind(produitController));
router.put("/:id/stock", produitController.mettreAJourStock.bind(produitController));
router.delete("/:id", produitController.supprimerProduit.bind(produitController));

module.exports = router;
