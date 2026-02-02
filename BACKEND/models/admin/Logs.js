const mongoose = require("mongoose");

const logsSchema = new mongoose.Schema({
  utilisateur_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Utilisateur",
    required: true
  },
  details: {
    type: String,
    required: true
  },
  date_heure: {
    type: Date,
    default: Date.now
  }
});

logsSchema.index({ utilisateur_id: 1, date_heure: -1 });

module.exports = mongoose.model("Logs", logsSchema);
