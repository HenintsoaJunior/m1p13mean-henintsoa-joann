const mongoose = require("mongoose");

const mouvementStockSchema = new mongoose.Schema(
  {
    idBoutique: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boutique",
      required: [true, "L'ID de la boutique est requis"],
    },
    idProduit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Produit",
      required: [true, "L'ID du produit est requis"],
    },
    idVariante: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    type: {
      type: String,
      enum: {
        values: ["entree", "sortie"],
        message: "Le type doit être 'entree' ou 'sortie'",
      },
      required: [true, "Le type de mouvement est requis"],
    },
    quantite: {
      type: Number,
      required: [true, "La quantité est requise"],
      min: [1, "La quantité doit être au moins 1"],
    },
    motif: {
      type: String,
      enum: {
        values: [
          "achat_fournisseur",
          "retour_client",
          "ajustement_inventaire",
          "vente",
          "perte",
          "transfert",
          "autre",
        ],
        message: "Motif invalide",
      },
      required: [true, "Le motif est requis"],
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, "La note ne peut pas dépasser 500 caractères"],
      default: "",
    },
    stockAvant: {
      type: Number,
      required: true,
      min: 0,
    },
    stockApres: {
      type: Number,
      required: true,
      min: 0,
    },
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilisateur",
      required: true,
    },
  },
  {
    timestamps: { createdAt: "dateCreation", updatedAt: "dateMiseAJour" },
  }
);

mouvementStockSchema.index({ idBoutique: 1, dateCreation: -1 });
mouvementStockSchema.index({ idProduit: 1, dateCreation: -1 });

module.exports = mongoose.model("MouvementStock", mouvementStockSchema);
