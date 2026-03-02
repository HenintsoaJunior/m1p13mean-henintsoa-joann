const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    idBoutique: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boutique",
      required: [true, "L'ID de la boutique est requis"],
    },
    // soit la promotion s'applique à un produit précis, une variante particulière, à une catégorie, ou globalement
    idProduit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Produit",
    },
    idVariante: {
      // stocke l'identifiant interne de variante (index ou autre)
      type: String,
      default: null
    },
    idCategorie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categorie",
    },
    type: {
      type: String,
      enum: ["pourcentage", "montant"],
      required: [true, "Le type de réduction est requis"],
    },
    valeur: {
      type: Number,
      required: [true, "La valeur de la réduction est requise"],
      min: [0, "La valeur de la réduction ne peut pas être négative"],
    },
    dateDebut: {
      type: Date,
      required: [true, "La date de début est requise"],
    },
    dateFin: {
      type: Date,
      required: [true, "La date de fin est requise"],
    },
    statut: {
      type: String,
      enum: ["active", "inactive", "archive"],
      default: "active",
    },
  },
  {
    timestamps: { createdAt: "dateCreation", updatedAt: "dateMiseAJour" },
  }
);

// indices utiles
promotionSchema.index({ idBoutique: 1 });
promotionSchema.index({ idProduit: 1 });
promotionSchema.index({ idVariante: 1 });
promotionSchema.index({ idCategorie: 1 });
promotionSchema.index({ statut: 1 });

// méthode utilitaire pour savoir si la promotion est valable à une date donnée
promotionSchema.methods.estActive = function (date = new Date()) {
  return (
    this.statut === "active" &&
    date >= this.dateDebut &&
    date <= this.dateFin
  );
};

module.exports = mongoose.model("Promotion", promotionSchema);
