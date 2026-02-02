const mongoose = require("mongoose");

const emplacementSchema = new mongoose.Schema({
  etage_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Etage",
    required: true
  },
  code: {
    type: String,
    required: [true, "Le code est requis"],
    trim: true
  },
  type: {
    type: String,
    enum: ["box", "kiosque", "zone_loisirs", "zone_commune", "pop_up", "autre"],
    required: true
  },
  nom: {
    type: String,
    trim: true
  },
  surface_m2: Number,
  position: {
    type: {
      type: String,
      enum: ["polygone", "point"]
    },
    coordonnees: [[Number]]
  },
  statut: {
    type: String,
    enum: ["libre", "occupe", "reserve", "en_travaux", "en_negociation"],
    default: "libre"
  },
  loyer_mensuel: Number,
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

emplacementSchema.index({ etage_id: 1, code: 1 });
emplacementSchema.index({ statut: 1 });

module.exports = mongoose.model("Emplacement", emplacementSchema);
