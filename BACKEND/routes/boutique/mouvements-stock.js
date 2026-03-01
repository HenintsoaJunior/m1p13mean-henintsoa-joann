const express = require("express");
const router = express.Router();
const { authentification, interdireAccesInterdit } = require("../../middleware/auth");
const controller = require("../../controllers/boutique/MouvementStockController");

router.use(authentification);
router.use(interdireAccesInterdit);

router.use((req, res, next) => {
  if (req.utilisateur.role === "boutique" || req.utilisateur.role === "admin") {
    next();
  } else {
    return res.status(403).json({ erreur: "Accès refusé. Permissions insuffisantes." });
  }
});

router.post("/", controller.creerMouvement.bind(controller));
router.get("/", controller.listerMouvements.bind(controller));
router.get("/stats", controller.stats.bind(controller));
router.get("/produit/:idProduit", controller.listerParProduit.bind(controller));

module.exports = router;
