const express = require("express");
const router = express.Router();
const centreController = require("../../controllers/admin/CentreController");

router.post("/", centreController.createCentre);
router.get("/", centreController.getAllCentres);
router.get("/near", centreController.findNearCentres);
router.get("/:id/plan", centreController.getCentreWithPlan);
router.get("/slug/:slug", centreController.getCentreBySlug);
router.get("/:id", centreController.getCentreById);
router.put("/:id", centreController.updateCentre);
router.delete("/:id", centreController.deleteCentre);

module.exports = router;
