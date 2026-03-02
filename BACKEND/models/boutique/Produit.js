const mongoose = require("mongoose");

const produitSchema = new mongoose.Schema(
  {
    idBoutique: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boutique",
      required: [true, "L'ID de la boutique est requis"],
    },
    idCategorie: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Categorie" }],
      required: [true, "Au moins une catégorie est requise"],
      validate: {
        validator: function(v) { return Array.isArray(v) && v.length > 0; },
        message: "Au moins une catégorie est requise",
      },
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
    images: {
      type: [String],
      default: [],
    },
    variantes: [
      {
        couleur: {
          type: String,
          trim: true,
        },
        couleurHex: {
          type: String,
          trim: true,
        },
        unite: {
          type: String,
          trim: true,
        },
        typeUnitePrincipal: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TypeUnite",
        },
        prix: {
          devise: {
            type: String,
            uppercase: true,
            trim: true,
            default: "Ar",
          },
          montant: {
            type: Number,
            required: [true, "Le prix est requis"],
            min: [0, "Le prix ne peut pas être négatif"],
            default: 0,
          },
        },
        stock: {
          quantite: {
            type: Number,
            required: [true, "Le stock est requis"],
            min: [0, "Le stock ne peut pas être négatif"],
            default: 0,
          },
        },
      },
    ],
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
  },
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
