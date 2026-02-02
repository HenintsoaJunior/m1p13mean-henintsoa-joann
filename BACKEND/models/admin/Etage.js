const mongoose = require("mongoose");

const etageSchema = new mongoose.Schema({
  batiment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batiment"
  },
  nom: {
    type: String,
    required: [true, "Le nom est requis"],
    trim: true
  },
  niveau: {
    type: Number,
    required: true
  },
  surface_totale_m2: Number,
  hauteur_sous_plafond_m: Number,
  cree_le: {
    type: Date,
    default: Date.now
  },
  modifie_le: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: "cree_le", updatedAt: "modifie_le" }
});

etageSchema.index({ batiment_id: 1, niveau: 1 });

module.exports = mongoose.model("Etage", etageSchema);
