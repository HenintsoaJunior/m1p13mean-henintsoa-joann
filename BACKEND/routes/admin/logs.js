const express = require('express');
const router = express.Router();
const logController = require('../../controllers/admin/LogsController');
const { authentification, verifierRole } = require('../../middleware/auth');

// Get all logs
router.get('/', authentification, verifierRole('admin'), logController.getAllLogs);

// Get logs by entity
router.get('/entity/:entity', authentification, verifierRole('admin'), logController.getLogsByEntity);

// Get logs by action
router.get('/action/:action', authentification, verifierRole('admin'), logController.getLogsByAction);

// Create a new log
router.post('/', authentification, verifierRole('admin'), logController.createLog);

module.exports = router;
