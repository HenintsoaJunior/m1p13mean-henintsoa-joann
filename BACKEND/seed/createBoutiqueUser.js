const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Utilisateur = require("../models/Utilisateur");

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, "../.env") });

// Fonction pour créer un utilisateur boutique
async function createBoutiqueUser() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connecté à MongoDB");

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await Utilisateur.findOne({
      email: "boutique@gmail.com",
    });

    if (existingUser) {
      console.log("⚠️  L'utilisateur boutique existe déjà");
      await mongoose.connection.close();
      return;
    }

    // Créer l'utilisateur boutique
    const boutiqueUser = await Utilisateur.create({
      email: "boutique@gmail.com",
      mot_de_passe: "Carasco@20",
      prenom: "Jean",
      nom: "Boutique",
      telephone: "+261 34 00 000 00",
      role: "boutique",
      actif: true,
    });

    console.log("✅ Utilisateur boutique créé avec succès:");
    console.log({
      _id: boutiqueUser._id,
      email: boutiqueUser.email,
      prenom: boutiqueUser.prenom,
      nom: boutiqueUser.nom,
      role: boutiqueUser.role,
      actif: boutiqueUser.actif,
    });

    // Fermer la connexion
    await mongoose.connection.close();
    console.log("🔌 Connexion MongoDB fermée");
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'utilisateur:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Exécuter la fonction
createBoutiqueUser();
