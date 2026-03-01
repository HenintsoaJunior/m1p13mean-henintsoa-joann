const express = require("express");
const router = express.Router();
const { authentification, interdireAccesInterdit } = require("../../middleware/auth");
const commandeController = require("../../controllers/boutique/CommandeController");

router.use(authentification);
router.use(interdireAccesInterdit);

router.use((req, res, next) => {
  if (!req.utilisateur) {
    return res.status(401).json({ erreur: "Accès refusé. Utilisateur non authentifié." });
  }
  if (req.utilisateur.role === "boutique" || req.utilisateur.role === "admin") {
    next();
  } else {
    return res.status(403).json({ erreur: "Accès refusé. Permissions insuffisantes." });
  }
});

router.post("/", commandeController.creerCommande.bind(commandeController));
router.get("/", commandeController.listerCommandes.bind(commandeController));
router.get("/stats", commandeController.stats.bind(commandeController));
router.get("/:id", commandeController.obtenirCommande.bind(commandeController));
router.put("/:id", commandeController.modifierCommande.bind(commandeController));
router.put("/:id/statut", commandeController.modifierStatut.bind(commandeController));
router.delete("/:id", commandeController.supprimerCommande.bind(commandeController));

module.exports = router;
