const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

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

// Hasher le mot de passe avant sauvegarde
utilisateurSchema.pre("save", async function () {
  if (!this.isModified("mot_de_passe")) return;
  try {
    const salt = await bcrypt.genSalt(12);
    this.mot_de_passe = await bcrypt.hash(this.mot_de_passe, salt);
  } catch (error) {
    console.error("Erreur lors du hashage du mot de passe:", error);
    throw error;
  }
});

const Utilisateur = mongoose.model("Utilisateur", utilisateurSchema);

async function createAdmin() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connecté à MongoDB");

    // Créer l'admin par défaut
    const adminData = {
      email: "admin@gmail.com",
      mot_de_passe: "admin1234",
      prenom: "Super",
      nom: "Admin",
      telephone: "+261 34 00 000 00",
      role: "admin",
      actif: true,
    };

    const admin = await Utilisateur.create(adminData);

    console.log("✅ Utilisateur admin créé avec succès!");
    console.log("\n--- Informations de connexion ---");
    console.log(`Email: ${admin.email}`);
    console.log(`Mot de passe: admin1234`);
    console.log("----------------------------------\n");

    await mongoose.disconnect();
    console.log("✅ Déconnecté de MongoDB");
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    process.exit(1);
  }
}

createAdmin();
