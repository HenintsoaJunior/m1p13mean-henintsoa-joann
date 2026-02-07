#!/bin/bash

# Script pour créer les fichiers backend de journalisation

# Créer le répertoire model s'il n'existe pas
mkdir -p ../BACKEND/model

# Créer le modèle Logs.js
cat > ../BACKEND/model/Logs.js << 'EOF'
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE'],
    required: true
  },
  entity: {
    type: String,
    required: true
  },
  entityId: {
    type: Number,
    default: null
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Log', logSchema);
EOF

echo "Modèle Logs.js créé avec succès!"

# Créer le répertoire controller s'il n'existe pas
mkdir -p ../BACKEND/controller

# Créer le contrôleur logController.js
cat > ../BACKEND/controller/logController.js << 'EOF'
const Log = require('../model/Logs');

const logController = {
  // Get all logs
  getAllLogs: async (req, res) => {
    try {
      const logs = await Log.find()
        .sort({ timestamp: -1 }) // Newest first
      
      res.status(200).json({
        success: true,
        data: logs
      });
    } catch (error) {
      console.error('Error getting logs:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des logs',
        error: error.message
      });
    }
  },

  // Get logs by entity
  getLogsByEntity: async (req, res) => {
    try {
      const { entity } = req.params;
      
      const logs = await Log.find({ entity })
        .sort({ timestamp: -1 });
      
      res.status(200).json({
        success: true,
        data: logs
      });
    } catch (error) {
      console.error('Error getting logs by entity:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des logs',
        error: error.message
      });
    }
  },

  // Get logs by action
  getLogsByAction: async (req, res) => {
    try {
      const { action } = req.params;
      
      const logs = await Log.find({ action })
        .sort({ timestamp: -1 });
      
      res.status(200).json({
        success: true,
        data: logs
      });
    } catch (error) {
      console.error('Error getting logs by action:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des logs',
        error: error.message
      });
    }
  },

  // Create a new log entry
  createLog: async (req, res) => {
    try {
      const { userId, action, entity, entityId, oldValue, newValue } = req.body;
      
      const newLog = new Log({
        userId,
        action,
        entity,
        entityId,
        oldValue,
        newValue,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      const savedLog = await newLog.save();
      
      res.status(201).json({
        success: true,
        data: savedLog
      });
    } catch (error) {
      console.error('Error creating log:', error);
      res.status(400).json({
        success: false,
        message: 'Erreur lors de la création du log',
        error: error.message
      });
    }
  }
};

module.exports = logController;
EOF

echo "Contrôleur logController.js créé avec succès!"

# Créer le répertoire routes s'il n'existe pas
mkdir -p ../BACKEND/routes

# Créer les routes logs.js
cat > ../BACKEND/routes/logs.js << 'EOF'
const express = require('express');
const router = express.Router();
const logController = require('../controller/logController');
const { authenticateToken } = require('../middleware/auth'); // Assuming you have auth middleware

// Get all logs
router.get('/', authenticateToken, logController.getAllLogs);

// Get logs by entity
router.get('/entity/:entity', authenticateToken, logController.getLogsByEntity);

// Get logs by action
router.get('/action/:action', authenticateToken, logController.getLogsByAction);

// Create a new log
router.post('/', authenticateToken, logController.createLog);

module.exports = router;
EOF

echo "Routes logs.js créées avec succès!"

# Instructions pour intégrer les routes
echo ""
echo "Pour terminer l'intégration, ajoutez cette ligne à votre fichier principal (ex. server.js ou app.js) :"
echo "const logsRoutes = require('./routes/logs');"
echo "app.use('/api/logs', logsRoutes);"
echo ""
echo "Redémarrez votre serveur backend après avoir ajouté ces lignes."