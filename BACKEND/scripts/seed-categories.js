const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const Categorie = require("../models/boutique/Categorie");

// Structure de catégories récursives pour une boutique (child 0 et child 1 uniquement)
const categoriesStructure = [
  {
    nom: "Électronique",
    slug: "electronique",
    description: "Produits électroniques et high-tech",
    enfants: [
      {
        nom: "Smartphones",
        slug: "smartphones",
        description: "Téléphones portables et accessoires",
        enfants: []
      },
      {
        nom: "Ordinateurs",
        slug: "ordinateurs",
        description: "Ordinateurs portables et de bureau",
        enfants: []
      },
      {
        nom: "Audio & Son",
        slug: "audio-son",
        description: "Équipements audio et sonorisation",
        enfants: []
      }
    ]
  },
  {
    nom: "Vêtements",
    slug: "vetements",
    description: "Vêtements et mode",
    enfants: [
      {
        nom: "Homme",
        slug: "homme",
        description: "Vêtements pour homme",
        enfants: []
      },
      {
        nom: "Femme",
        slug: "femme",
        description: "Vêtements pour femme",
        enfants: []
      },
      {
        nom: "Enfant",
        slug: "enfant",
        description: "Vêtements pour enfant",
        enfants: []
      }
    ]
  },
  {
    nom: "Maison & Jardin",
    slug: "maison-jardin",
    description: "Équipements pour la maison et le jardin",
    enfants: [
      {
        nom: "Décoration",
        slug: "decoration",
        description: "Articles de décoration",
        enfants: []
      },
      {
        nom: "Cuisine",
        slug: "cuisine",
        description: "Équipements de cuisine",
        enfants: []
      },
      {
        nom: "Jardin",
        slug: "jardin",
        description: "Équipements de jardinage",
        enfants: []
      }
    ]
  },
  {
    nom: "Sports & Loisirs",
    slug: "sports-loisirs",
    description: "Équipements sportifs et de loisirs",
    enfants: [
      {
        nom: "Fitness",
        slug: "fitness",
        description: "Équipements de fitness",
        enfants: []
      },
      {
        nom: "Sports Collectifs",
        slug: "sports-collectifs",
        description: "Équipements pour sports collectifs",
        enfants: []
      }
    ]
  }
];

// Fonction pour créer récursivement les catégories
async function createCategories(idBoutique, categories, parentId = null) {
  const createdCategories = [];
  
  for (const catData of categories) {
    const { enfants, ...categorieData } = catData;
    
    const nouvelleCategorie = await Categorie.create({
      ...categorieData,
      idBoutique,
      idCategorieParent: parentId,
    });
    
    createdCategories.push(nouvelleCategorie);
    console.log(`✅ Créée: ${categorieData.nom}`);
    
    // Créer les enfants récursivement
    if (enfants && enfants.length > 0) {
      await createCategories(idBoutique, enfants, nouvelleCategorie._id);
    }
  }
  
  return createdCategories;
}

async function seedCategories() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connecté à MongoDB");

    // Récupérer l'ID de la boutique depuis les variables d'environnement (optionnel)
    const idBoutique = process.env.BOUTIQUE_ID || null;

    if (idBoutique) {
      console.log(`🏪  Boutique ciblée : ${idBoutique}`);
    } else {
      console.log("ℹ️   Aucun BOUTIQUE_ID défini — idBoutique sera null");
    }

    // Supprimer les catégories existantes de la boutique
    await Categorie.deleteMany({ idBoutique });
    console.log("🗑️  Anciennes catégories supprimées");

    // Créer les catégories récursives
    console.log("\n📁 Création des catégories récursives...\n");
    await createCategories(idBoutique, categoriesStructure);

    console.log("\n✅ Seed des catégories terminé avec succès!");
    console.log("\n--- Récapitulatif ---");
    const totalCategories = await Categorie.countDocuments({ idBoutique });
    console.log(`Total catégories créées: ${totalCategories}`);
    console.log("---------------------\n");

    await mongoose.disconnect();
    console.log("✅ Déconnecté de MongoDB");
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedCategories();
