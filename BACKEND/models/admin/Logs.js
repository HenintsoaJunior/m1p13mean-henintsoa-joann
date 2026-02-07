const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId: {
    type: String, // Utilisation de String pour correspondre à l'ObjectId MongoDB
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
    type: String, // Utilisation de String pour correspondre à l'ObjectId MongoDB
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
