const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const utilisateurSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Email invalide"],
    },
    mot_de_passe: {
      type: String,
      required: [true, "Le mot de passe est requis"],
      minlength: [6, "Le mot de passe doit contenir au moins 6 caractères"],
    },
    prenom: {
      type: String,
      required: [true, "Le prénom est requis"],
      trim: true,
      maxlength: [50, "Le prénom ne peut pas dépasser 50 caractères"],
    },
    nom: {
      type: String,
      required: [true, "Le nom est requis"],
      trim: true,
      maxlength: [50, "Le nom ne peut pas dépasser 50 caractères"],
    },
    telephone: {
      type: String,
      trim: true,
      match: [/^[\d\s\+\-\(\)]+$/, "Numéro de téléphone invalide"],
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "boutique", "client"],
        message: "Le rôle doit être admin, boutique ou client",
      },
      default: "client",
    },
    actif: {
      type: Boolean,
      default: true,
    },
    cree_le: {
      type: Date,
      default: Date.now,
    },
    modifie_le: {
      type: Date,
      default: Date.now,
    },
    token_reinitialisation_mdp: {
      type: String,
      default: null,
    },
    expiration_reinitialisation_mdp: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "cree_le", updatedAt: "modifie_le" },
  },
);

// Index pour améliorer les performances
utilisateurSchema.index({ email: 1 });
utilisateurSchema.index({ role: 1 });

// ========== MIDDLEWARE ==========

// Middleware pre-save pour hasher le mot de passe
utilisateurSchema.pre("save", async function () {
  // Ne hasher que si le mot de passe a été modifié
  if (!this.isModified("mot_de_passe")) return;

  try {
    // Hasher le mot de passe avec un salt de 12 rounds
    const salt = await bcrypt.genSalt(12);
    this.mot_de_passe = await bcrypt.hash(this.mot_de_passe, salt);
  } catch (error) {
    console.error("Erreur lors du hashage du mot de passe:", error);
    throw error;
  }
});

// ========== MÉTHODES UTILITAIRES SIMPLES ==========

// Méthode pour comparer les mots de passe (utilitaire technique)
utilisateurSchema.methods.comparerMotDePasse = async function (
  motDePasseCandidat,
) {
  return await bcrypt.compare(motDePasseCandidat, this.mot_de_passe);
};

// Méthode pour obtenir les informations publiques (utilitaire de sérialisation)
utilisateurSchema.methods.toJSON = function () {
  const utilisateur = this.toObject();
  delete utilisateur.mot_de_passe;
  delete utilisateur.token_reinitialisation_mdp;
  delete utilisateur.expiration_reinitialisation_mdp;
  return utilisateur;
};

module.exports = mongoose.model("Utilisateur", utilisateurSchema);
