const mongoose = require("mongoose");

const batimentSchema = new mongoose.Schema({
  centre_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Centre",
    required: true
  },
  nom: {
    type: String,
    required: [true, "Le nom est requis"],
    trim: true
  },
  description: String,
  nombre_etages: {
    type: Number,
    default: 0
  },
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

batimentSchema.index({ centre_id: 1 });

module.exports = mongoose.model("Batiment", batimentSchema);
