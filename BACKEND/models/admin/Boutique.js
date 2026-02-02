const mongoose = require("mongoose");

const boutiqueSchema = new mongoose.Schema({
  appel_offre_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AppelOffre",
    required: true
  },
  contact: {
    nom: {
      type: String,
      required: true
    },
    prenom: {
      type: String,
      required: true
    },
    telephone: String,
    email: {
      type: String,
      match: [/^\S+@\S+\.\S+$/, "Email invalide"]
    },
    adresse: String
  },
  statut: {
    type: String,
    enum: ["active", "en_attente", "fermee"],
    default: "en_attente"
  }
});

boutiqueSchema.index({ appel_offre_id: 1 });
boutiqueSchema.index({ statut: 1 });

module.exports = mongoose.model("Boutique", boutiqueSchema);
