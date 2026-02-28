const mongoose = require("mongoose");

const tailleSchema = new mongoose.Schema(
  {
    valeur: {
      type: String,
      required: [true, "La valeur de la taille est requise"],
      trim: true,
      lowercase: true,
    },
    label: {
      type: String,
      trim: true,
    },
    typeUnite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TypeUnite",
      required: [true, "Le type d'unité est requis"],
    },
    ordre: {
      type: Number,
      default: 0,
    },
    estStandard: {
      type: Boolean,
      default: false,
    },
    estActif: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index unique sur la combinaison valeur + typeUnite
tailleSchema.index({ valeur: 1, typeUnite: 1 }, { unique: true });
tailleSchema.index({ typeUnite: 1 });
tailleSchema.index({ estStandard: 1 });

module.exports = mongoose.model("Taille", tailleSchema);
