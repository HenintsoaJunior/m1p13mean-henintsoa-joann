const mongoose = require("mongoose");

const reponseSchema = new mongoose.Schema({
  appel_offre_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AppelOffre",
    required: true,
  },
  boutique_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Boutique",
  },
  utilisateur_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Utilisateur",
  },
  montant_propose: { type: Number, required: true },
  email_proposeur: {
    type: String,
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
  },
  message: { type: String, trim: true, maxlength: 1000 },
  statut: {
    type: String,
    enum: ["propose", "accepte", "refuse"],
    default: "propose",
  },
  cree_le: {
    type: Date,
    default: Date.now,
  },
  modifie_le: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: { createdAt: "cree_le", updatedAt: "modifie_le" }
});

reponseSchema.index({ appel_offre_id: 1 });
reponseSchema.index({ boutique_id: 1 });

module.exports = mongoose.model("ReponseAppelOffre", reponseSchema);
