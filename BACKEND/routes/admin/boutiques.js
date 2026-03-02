const express = require("express");
const router = express.Router();
const boutiqueController = require("../../controllers/admin/BoutiqueController");

router.post("/", boutiqueController.createBoutique);
router.get("/", boutiqueController.getAllBoutiques);
router.get("/appel-offre/:appelOffreId", boutiqueController.getBoutiquesByAppelOffre);
router.get("/statut/:statut", boutiqueController.getBoutiquesByStatut);
router.get("/:id", boutiqueController.getBoutiqueById);
router.patch("/:id/desactiver", boutiqueController.desactiverBoutique);
router.put("/:id", boutiqueController.updateBoutique);
router.delete("/:id", boutiqueController.deleteBoutique);

module.exports = router;
