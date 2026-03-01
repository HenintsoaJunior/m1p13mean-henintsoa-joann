const mongoose = require("mongoose");

const marqueSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, "Le nom de la marque est requis"],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: [true, "Le slug est requis"],
      lowercase: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "La description ne peut pas dépasser 1000 caractères"],
    },
    logo: {
      type: String,
      trim: true,
    },
    siteWeb: {
      type: String,
      trim: true,
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

marqueSchema.index({ nom: 1 });
marqueSchema.index({ slug: 1 });

module.exports = mongoose.model("Marque", marqueSchema);
