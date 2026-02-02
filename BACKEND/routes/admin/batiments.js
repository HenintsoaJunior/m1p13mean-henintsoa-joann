const express = require("express");
const router = express.Router();
const batimentController = require("../../controllers/admin/BatimentController");

router.post("/", batimentController.createBatiment);
router.get("/", batimentController.getAllBatiments);
router.get("/centre/:centreId", batimentController.getBatimentsByCentre);
router.get("/:id", batimentController.getBatimentById);
router.put("/:id", batimentController.updateBatiment);
router.delete("/:id", batimentController.deleteBatiment);

module.exports = router;
