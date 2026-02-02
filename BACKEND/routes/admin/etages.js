const express = require("express");
const router = express.Router();
const etageController = require("../../controllers/admin/EtageController");

router.post("/", etageController.createEtage);
router.get("/", etageController.getAllEtages);
router.get("/batiment/:batimentId", etageController.getEtagesByBatiment);
router.get("/:id", etageController.getEtageById);
router.put("/:id", etageController.updateEtage);
router.delete("/:id", etageController.deleteEtage);

module.exports = router;
