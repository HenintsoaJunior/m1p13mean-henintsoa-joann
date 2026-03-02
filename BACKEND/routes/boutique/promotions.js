const express = require("express");
const router = express.Router();
const { authentification, interdireAccesInterdit } = require("../../middleware/auth");
const promoController = require("../../controllers/boutique/PromotionController");

// l'accès admin (boutique) requis pour la gestion complète
router.use(authentification);
router.use(interdireAccesInterdit);
router.use((req, res, next) => {
  if (!req.utilisateur) {
    return res.status(401).json({ erreur: "Utilisateur non authentifié" });
  }
  if (req.utilisateur.role === "boutique" || req.utilisateur.role === "admin") {
    return next();
  }
  return res.status(403).json({ erreur: "Permissions insuffisantes" });
});

// CRUD promotions
// Routes spéciales AVANT la route /:id générique
router.get("/actives/:idBoutique", promoController.promotionsActives.bind(promoController));

router.post("/", promoController.creerPromotion.bind(promoController));
router.get("/", promoController.listerPromotions.bind(promoController));
router.get("/:id", promoController.obtenirPromotion.bind(promoController));
router.put("/:id", promoController.mettreAJourPromotion.bind(promoController));
router.delete("/:id", promoController.supprimerPromotion.bind(promoController));

module.exports = router;
