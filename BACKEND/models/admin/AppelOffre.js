const mongoose = require("mongoose");

const appelOffreSchema = new mongoose.Schema({
  emplacement_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Emplacement",
    required: true
  },
  date_appel: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: true
  },
  statut: {
    type: String,
    enum: ["ouvert", "ferme", "attribue"],
    default: "ouvert"
  }
});

appelOffreSchema.index({ emplacement_id: 1, statut: 1 });
appelOffreSchema.index({ date_appel: -1 });

module.exports = mongoose.model("AppelOffre", appelOffreSchema);
