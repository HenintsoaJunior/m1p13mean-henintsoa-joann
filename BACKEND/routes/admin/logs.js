const express = require("express");
const router = express.Router();
const logsController = require("../../controllers/admin/LogsController");

router.post("/", logsController.createLog);
router.get("/", logsController.getAllLogs);
router.get("/:id", logsController.getLogById);
router.get("/utilisateur/:utilisateurId", logsController.getLogsByUtilisateur);
router.delete("/:id", logsController.deleteLog);

module.exports = router;
