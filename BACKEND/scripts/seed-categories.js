const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const Categorie = require("../models/boutique/Categorie");
const Boutique = require("../models/admin/Boutique");

// Structure de catégories récursives pour une boutique
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
        enfants: [
          {
            nom: "iPhone",
            slug: "iphone",
            description: "Smartphones Apple iPhone",
            enfants: []
          },
          {
            nom: "Samsung Galaxy",
            slug: "samsung-galaxy",
            description: "Smartphones Samsung Galaxy",
            enfants: []
          },
          {
            nom: "Accessoires Smartphones",
            slug: "accessoires-smartphones",
            description: "Coques, chargeurs, écouteurs",
            enfants: []
          }
        ]
      },
      {
        nom: "Ordinateurs",
        slug: "ordinateurs",
        description: "Ordinateurs portables et de bureau",
        enfants: [
          {
            nom: "Laptops",
            slug: "laptops",
            description: "Ordinateurs portables",
            enfants: [
              {
                nom: "MacBook",
                slug: "macbook",
                description: "Ordinateurs portables Apple",
                enfants: []
              },
              {
                nom: "PC Portables",
                slug: "pc-portables",
                description: "Ordinateurs portables Windows",
                enfants: []
              }
            ]
          },
          {
            nom: "Desktops",
            slug: "desktops",
            description: "Ordinateurs de bureau",
            enfants: []
          },
          {
            nom: "Composants",
            slug: "composants",
            description: "Composants informatiques",
            enfants: []
          }
        ]
      },
      {
        nom: "Audio & Son",
        slug: "audio-son",
        description: "Équipements audio et sonorisation",
        enfants: [
          {
            nom: "Casques",
            slug: "casques",
            description: "Casques audio et écouteurs",
            enfants: []
          },
          {
            nom: "Enceintes",
            slug: "enceintes",
            description: "Enceintes et haut-parleurs",
            enfants: []
          }
        ]
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
        enfants: [
          {
            nom: "T-shirts & Polos",
            slug: "t-shirts-polos-homme",
            description: "T-shirts et polos pour homme",
            enfants: []
          },
          {
            nom: "Pantalons",
            slug: "pantalons-homme",
            description: "Pantalons pour homme",
            enfants: []
          },
          {
            nom: "Vestes & Manteaux",
            slug: "vestes-manteaux-homme",
            description: "Vestes et manteaux pour homme",
            enfants: []
          }
        ]
      },
      {
        nom: "Femme",
        slug: "femme",
        description: "Vêtements pour femme",
        enfants: [
          {
            nom: "Robes",
            slug: "robes",
            description: "Robes pour femme",
            enfants: []
          },
          {
            nom: "Hauts",
            slug: "hauts-femme",
            description: "Hauts pour femme",
            enfants: []
          },
          {
            nom: "Bas",
            slug: "bas-femme",
            description: "Pantalons, jupes pour femme",
            enfants: []
          }
        ]
      },
      {
        nom: "Enfant",
        slug: "enfant",
        description: "Vêtements pour enfant",
        enfants: [
          {
            nom: "Garçon",
            slug: "garcon",
            description: "Vêtements pour garçon",
            enfants: []
          },
          {
            nom: "Fille",
            slug: "fille",
            description: "Vêtements pour fille",
            enfants: []
          }
        ]
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
        enfants: [
          {
            nom: "Luminaires",
            slug: "luminaires",
            description: "Lampes et éclairages",
            enfants: []
          },
          {
            nom: "Textiles",
            slug: "textiles",
            description: "Coussins, rideaux, tapis",
            enfants: []
          }
        ]
      },
      {
        nom: "Cuisine",
        slug: "cuisine",
        description: "Équipements de cuisine",
        enfants: [
          {
            nom: "Ustensiles",
            slug: "ustensiles",
            description: "Ustensiles de cuisine",
            enfants: []
          },
          {
            nom: "Électroménager",
            slug: "electromenager",
            description: "Appareils électroménagers",
            enfants: []
          }
        ]
      },
      {
        nom: "Jardin",
        slug: "jardin",
        description: "Équipements de jardinage",
        enfants: [
          {
            nom: "Outils",
            slug: "outils-jardin",
            description: "Outils de jardinage",
            enfants: []
          },
          {
            nom: "Plantes",
            slug: "plantes",
            description: "Plantes et graines",
            enfants: []
          }
        ]
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
        enfants: [
          {
            nom: "Musculation",
            slug: "musculation",
            description: "Équipements de musculation",
            enfants: []
          },
          {
            nom: "Cardio",
            slug: "cardio",
            description: "Vélos, tapis de course",
            enfants: []
          }
        ]
      },
      {
        nom: "Sports Collectifs",
        slug: "sports-collectifs",
        description: "Équipements pour sports collectifs",
        enfants: [
          {
            nom: "Football",
            slug: "football",
            description: "Équipements de football",
            enfants: []
          },
          {
            nom: "Basketball",
            slug: "basketball",
            description: "Équipements de basketball",
            enfants: []
          }
        ]
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

    // Le modèle Boutique nécessite un appel_offre_id, qui nécessite un emplacement_id
    // Nous allons créer une structure minimale pour le test
    
    // Créer ou trouver un emplacement de test
    let Emplacement;
    try {
      Emplacement = mongoose.model('Emplacement');
    } catch (e) {
      const emplacementSchema = new mongoose.Schema({
        nom: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        description: String,
        actif: { type: Boolean, default: true }
      });
      Emplacement = mongoose.model('Emplacement', emplacementSchema);
    }

    let emplacement = await Emplacement.findOne({ slug: "emplacement-test" });
    if (!emplacement) {
      emplacement = await Emplacement.create({
        nom: "Emplacement Test",
        slug: "emplacement-test",
        description: "Emplacement de test pour les catégories",
        actif: true
      });
      console.log("✅ Emplacement de test créé");
    }

    // Créer ou trouver un appel d'offre de test
    let AppelOffre;
    try {
      AppelOffre = mongoose.model('AppelOffre');
    } catch (e) {
      const appelOffreSchema = new mongoose.Schema({
        emplacement_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Emplacement",
          required: true
        },
        date_appel: { type: Date, default: Date.now },
        description: { type: String, required: true },
        statut: {
          type: String,
          enum: ["ouvert", "ferme", "attribue"],
          default: "ouvert"
        }
      });
      AppelOffre = mongoose.model('AppelOffre', appelOffreSchema);
    }

    let appelOffre = await AppelOffre.findOne({ description: "Appel d'offre test" });
    if (!appelOffre) {
      appelOffre = await AppelOffre.create({
        emplacement_id: emplacement._id,
        description: "Appel d'offre test",
        statut: "ouvert"
      });
      console.log("✅ Appel d'offre test créé");
    }

    // Trouver ou créer une boutique de test
    let boutique = await Boutique.findOne({ 
      $or: [
        { "contact.email": "boutique@test.com" },
        { slug: "boutique-test" }
      ]
    });
    
    if (!boutique) {
      boutique = await Boutique.create({
        appel_offre_id: appelOffre._id,
        contact: {
          nom: "Test",
          prenom: "Boutique",
          telephone: "+261 34 00 000 00",
          email: "boutique@test.com",
          adresse: "Rue de la Boutique, Antananarivo"
        },
        statut: "active"
      });
      console.log("✅ Boutique de test créée");
    } else {
      console.log("ℹ️  Boutique de test trouvée");
    }

    // Supprimer les catégories existantes de la boutique
    await Categorie.deleteMany({ idBoutique: boutique._id });
    console.log("🗑️  Anciennes catégories supprimées");

    // Créer les catégories récursives
    console.log("\n📁 Création des catégories récursives...\n");
    await createCategories(boutique._id, categoriesStructure);

    console.log("\n✅ Seed des catégories terminé avec succès!");
    console.log("\n--- Récapitulatif ---");
    console.log(`Boutique: ${boutique.contact.prenom} ${boutique.contact.nom} (${boutique._id})`);
    const totalCategories = await Categorie.countDocuments({ idBoutique: boutique._id });
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
