const express = require("express");
const router = express.Router();
const appelOffreController = require("../../controllers/admin/AppelOffreController");

router.post("/", appelOffreController.createAppelOffre);
router.get("/", appelOffreController.getAllAppelsOffre);
router.get("/emplacement/:emplacementId", appelOffreController.getAppelsOffreByEmplacement);
router.get("/statut/:statut", appelOffreController.getAppelsOffreByStatut);
router.get("/:id", appelOffreController.getAppelOffreById);
router.put("/:id", appelOffreController.updateAppelOffre);
router.delete("/:id", appelOffreController.deleteAppelOffre);

module.exports = router;
