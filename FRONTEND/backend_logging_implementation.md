# Backend Logging Implementation

To complete the logging functionality, you need to implement the following files in your BACKEND directory:

## 1. Model: BACKEND/model/Logs.js

```javascript
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
```

## 2. Controller: BACKEND/controller/logController.js

```javascript
const Log = require('../model/Logs');

const logController = {
  // Get all logs
  getAllLogs: async (req, res) => {
    try {
      const logs = await Log.find()
        .sort({ timestamp: -1 }) // Newest first
        .populate('userId', 'nom email'); // Populate user info if needed
      
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
        .sort({ timestamp: -1 })
        .populate('userId', 'nom email');
      
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
        .sort({ timestamp: -1 })
        .populate('userId', 'nom email');
      
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
      const { userId, action, entity, entityId, oldValue, newValue, ipAddress, userAgent } = req.body;
      
      const newLog = new Log({
        userId,
        action,
        entity,
        entityId,
        oldValue,
        newValue,
        ipAddress: ipAddress || req.ip,
        userAgent: userAgent || req.get('User-Agent')
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
```

## 3. Routes: BACKEND/routes/logs.js

```javascript
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
```

## 4. Add to main server file (e.g., server.js or app.js)

```javascript
// Import the logs routes
const logsRoutes = require('./routes/logs');

// Use the logs routes
app.use('/api/logs', logsRoutes);
```

## Summary

With these backend files created and integrated, your frontend logging system will work as follows:

1. The logging interceptor automatically captures all POST, PUT, PATCH, and DELETE requests (excluding GET requests)
2. Each captured request triggers a log entry creation via the LogService
3. The backend stores these logs in MongoDB
4. The Activity History component displays all logged activities

Make sure to create these files in your BACKEND directory and restart your backend server for the changes to take effect.