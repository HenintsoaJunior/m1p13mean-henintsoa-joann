const mongoose = require("mongoose");

const categorieSchema = new mongoose.Schema(
  {
    idBoutique: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boutique",
      required: [true, "L'ID de la boutique est requis"],
    },
    nom: {
      type: String,
      required: [true, "Le nom de la catégorie est requis"],
      trim: true,
      maxlength: [100, "Le nom ne peut pas dépasser 100 caractères"],
    },
    slug: {
      type: String,
      required: [true, "Le slug est requis"],
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "La description ne peut pas dépasser 500 caractères"],
    },
    idCategorieParent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categorie",
      default: null,
    },
    urlImage: {
      type: String,
      trim: true,
    },
    dateCreation: {
      type: Date,
      default: Date.now,
    },
    dateMiseAJour: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "dateCreation", updatedAt: "dateMiseAJour" },
  }
);

// Index composés pour optimiser les recherches
categorieSchema.index({ idBoutique: 1, slug: 1 });
categorieSchema.index({ idCategorieParent: 1 });

// Middleware pour mettre à jour dateMiseAJour
categorieSchema.pre("save", function (next) {
  this.dateMiseAJour = Date.now();
  next();
});

// Méthode pour obtenir les informations publiques
categorieSchema.methods.toJSON = function () {
  const categorie = this.toObject();
  return categorie;
};

module.exports = mongoose.model("Categorie", categorieSchema);
