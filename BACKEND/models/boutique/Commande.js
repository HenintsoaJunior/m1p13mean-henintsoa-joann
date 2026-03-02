const mongoose = require("mongoose");

const ligneCommandeSchema = new mongoose.Schema({
  idProduit: { type: mongoose.Schema.Types.ObjectId, ref: "Produit" },
  idVariante: { type: mongoose.Schema.Types.ObjectId },
  nomProduit: { type: String },
  couleur: { type: String },
  unite: { type: String },
  prixUnitaire: { type: Number, required: true },
  quantite: { type: Number, required: true, min: 1 },
  sousTotal: { type: Number },
});

const commandeSchema = new mongoose.Schema(
  {
    idBoutique: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boutique",
      required: true,
    },
    reference: {
      type: String,
      unique: true,
    },
    client: {
      nom: { type: String, required: true },
      prenom: { type: String },
      email: { type: String },
      telephone: { type: String },
      adresse: { type: String },
    },
    lignes: [ligneCommandeSchema],
    statut: {
      type: String,
      enum: ["en_attente", "confirmee", "expediee", "livree", "annulee"],
      default: "en_attente",
    },
    total: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Commande", commandeSchema);
