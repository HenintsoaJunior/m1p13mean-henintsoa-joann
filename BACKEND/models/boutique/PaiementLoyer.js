const mongoose = require("mongoose");

const paiementLoyerSchema = new mongoose.Schema({
  boutique_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Boutique",
    required: true,
  },
  emplacement_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Emplacement",
    required: true,
  },
  stripe_payment_intent_id: {
    type: String,
    unique: true,
    sparse: true,
  },
  montant: {
    type: Number,
    required: true,
  },
  // Format: "2025-01" (YYYY-MM)
  mois_loyer: {
    type: String,
    required: true,
    match: [/^\d{4}-\d{2}$/, "Format mois invalide (YYYY-MM)"],
  },
  statut: {
    type: String,
    enum: ["en_attente", "paye", "echoue"],
    default: "en_attente",
  },
  date_paiement: {
    type: Date,
  },
  facture_envoyee: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: { createdAt: "cree_le", updatedAt: "modifie_le" },
});

paiementLoyerSchema.index({ boutique_id: 1, mois_loyer: 1 });
paiementLoyerSchema.index({ statut: 1 });
paiementLoyerSchema.index({ stripe_payment_intent_id: 1 });

module.exports = mongoose.model("PaiementLoyer", paiementLoyerSchema);
