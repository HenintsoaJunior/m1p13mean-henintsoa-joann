const express = require("express");
const router = express.Router();
const emplacementController = require("../../controllers/admin/EmplacementController");

router.post("/", emplacementController.createEmplacement);
router.get("/", emplacementController.getAllEmplacements);
router.get("/etage/:etageId", emplacementController.getEmplacementsByEtage);
router.get("/statut/:statut", emplacementController.getEmplacementsByStatut);
router.get("/:id", emplacementController.getEmplacementById);
router.put("/:id", emplacementController.updateEmplacement);
router.delete("/:id", emplacementController.deleteEmplacement);

module.exports = router;
