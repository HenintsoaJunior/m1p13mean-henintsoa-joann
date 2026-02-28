const mongoose = require("mongoose");

const typeUniteSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, "Le nom du type d'unité est requis"],
      trim: true,
      unique: true,
      lowercase: true,
      enum: {
        values: ["standard", "liquide", "poids", "conditionnement", "personnalise"],
        message: "Type d'unité invalide",
      },
    },
    label: {
      type: String,
      required: [true, "Le label est requis"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: "📏",
    },
    valeurs: {
      type: [String],
      default: [],
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

typeUniteSchema.index({ nom: 1 });

module.exports = mongoose.model("TypeUnite", typeUniteSchema);
