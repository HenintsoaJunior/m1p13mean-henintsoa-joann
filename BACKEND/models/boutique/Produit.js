const mongoose = require("mongoose");

const produitSchema = new mongoose.Schema(
  {
    idBoutique: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boutique",
      required: [true, "L'ID de la boutique est requis"],
    },
    idCategorie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categorie",
      required: [true, "L'ID de la catégorie est requis"],
    },
    nom: {
      type: String,
      required: [true, "Le nom du produit est requis"],
      trim: true,
      maxlength: [200, "Le nom ne peut pas dépasser 200 caractères"],
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
      maxlength: [2000, "La description ne peut pas dépasser 2000 caractères"],
    },
    prix: {
      devise: {
        type: String,
        required: [true, "La devise est requise"],
        uppercase: true,
        trim: true,
        default: "EUR",
      },
      montant: {
        type: Number,
        required: [true, "Le montant est requis"],
        min: [0, "Le montant ne peut pas être négatif"],
      },
    },
    stock: {
      quantite: {
        type: Number,
        required: [true, "La quantité est requise"],
        min: [0, "La quantité ne peut pas être négative"],
        default: 0,
      },
    },
    images: {
      type: [String],
      default: [],
    },
    attributs: {
      couleur: {
        type: String,
        trim: true,
      },
      taille: {
        type: [String],
        default: [],
      },
      marque: {
        type: String,
        trim: true,
      },
    },
    statut: {
      type: String,
      enum: {
        values: ["actif", "rupture_stock", "archive"],
        message: "Le statut doit être actif, rupture_stock ou archive",
      },
      default: "actif",
    },
  },
  {
    timestamps: { createdAt: "dateCreation", updatedAt: "dateMiseAJour" },
  }
);

// Index composé pour optimiser les recherches
produitSchema.index({ idBoutique: 1, slug: 1 });
produitSchema.index({ idCategorie: 1 });
produitSchema.index({ statut: 1 });

// Méthode pour obtenir les informations publiques
produitSchema.methods.toJSON = function () {
  const produit = this.toObject();
  return produit;
};

module.exports = mongoose.model("Produit", produitSchema);
