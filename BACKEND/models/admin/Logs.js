const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  utilisateurId: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE'],
    required: true
  },
  entite: {
    type: String,
    required: true
  },
  entiteId: {
    type: String,
    default: null
  },
  ancienneValeur: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  nouvelleValeur: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  dateHeure: {
    type: Date,
    default: Date.now
  },
  adresseIp: {
    type: String,
    default: ''
  },
  navigateur: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Log', logSchema);
