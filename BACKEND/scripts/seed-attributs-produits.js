/**
 * Script de seed pour les attributs de produits
 * Crée les types d'unités, couleurs, tailles et marques par défaut
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const TypeUnite = require("../models/boutique/TypeUnite");
const Couleur = require("../models/boutique/Couleur");
const Taille = require("../models/boutique/Taille");
const Marque = require("../models/boutique/Marque");

// Données de seed pour les types d'unités
const typesUnitesData = [
  {
    nom: "standard",
    label: "Standard",
    description: "Tailles de vêtements standards (XS, S, M, L, XL...)",
    icon: "👕",
    valeurs: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
  },
  {
    nom: "liquide",
    label: "Liquide",
    description: "Volumes pour les liquides (cl, L...)",
    icon: "💧",
    valeurs: ["25cl", "33cl", "50cl", "75cl", "1L", "1.5L", "2L"],
  },
  {
    nom: "poids",
    label: "Poids",
    description: "Poids et masses (g, kg...)",
    icon: "⚖️",
    valeurs: ["50g", "100g", "250g", "500g", "1kg", "2kg", "5kg"],
  },
  {
    nom: "conditionnement",
    label: "Conditionnement",
    description: "Quantités et conditionnements (unités, cartons...)",
    icon: "📦",
    valeurs: [
      "1 unité",
      "3 unités",
      "6 unités",
      "12 unités",
      "24 unités",
      "Carton",
    ],
  },
  {
    nom: "personnalise",
    label: "Personnalisé",
    description: "Unités personnalisées définies par l'utilisateur",
    icon: "✏️",
    valeurs: [],
  },
];

// Données de seed pour les couleurs
const couleursData = [
  // Couleurs neutres
  { nom: "Blanc", codeHex: "#FFFFFF", categorie: "neutre" },
  { nom: "Noir", codeHex: "#000000", categorie: "neutre" },
  { nom: "Gris", codeHex: "#808080", categorie: "neutre" },
  { nom: "Gris Clair", codeHex: "#D3D3D3", categorie: "neutre" },
  { nom: "Gris Foncé", codeHex: "#A9A9A9", categorie: "neutre" },
  { nom: "Beige", codeHex: "#F5F5DC", categorie: "neutre" },
  { nom: "Marron", codeHex: "#8B4513", categorie: "neutre" },
  { nom: "Crème", codeHex: "#FFFDD0", categorie: "neutre" },

  // Couleurs chaudes
  { nom: "Rouge", codeHex: "#FF0000", categorie: "chaud" },
  { nom: "Rouge Foncé", codeHex: "#8B0000", categorie: "chaud" },
  { nom: "Orange", codeHex: "#FFA500", categorie: "chaud" },
  { nom: "Jaune", codeHex: "#FFFF00", categorie: "chaud" },
  { nom: "Jaune Moutarde", codeHex: "#FFDB58", categorie: "chaud" },
  { nom: "Or", codeHex: "#FFD700", categorie: "chaud" },
  { nom: "Corail", codeHex: "#FF7F50", categorie: "chaud" },
  { nom: "Bordeaux", codeHex: "#800020", categorie: "chaud" },

  // Couleurs froides
  { nom: "Bleu", codeHex: "#0000FF", categorie: "froid" },
  { nom: "Bleu Clair", codeHex: "#ADD8E6", categorie: "froid" },
  { nom: "Bleu Marine", codeHex: "#000080", categorie: "froid" },
  { nom: "Bleu Roi", codeHex: "#4169E1", categorie: "froid" },
  { nom: "Cyan", codeHex: "#00FFFF", categorie: "froid" },
  { nom: "Turquoise", codeHex: "#40E0D0", categorie: "froid" },
  { nom: "Vert", codeHex: "#008000", categorie: "froid" },
  { nom: "Vert Clair", codeHex: "#90EE90", categorie: "froid" },
  { nom: "Vert Foncé", codeHex: "#006400", categorie: "froid" },
  { nom: "Vert Olive", codeHex: "#808000", categorie: "froid" },
  { nom: "Vert Menthe", codeHex: "#98FF98", categorie: "froid" },
  { nom: "Violet", codeHex: "#800080", categorie: "froid" },
  { nom: "Violet Clair", codeHex: "#EE82EE", categorie: "froid" },
  { nom: "Lavande", codeHex: "#E6E6FA", categorie: "froid" },
  { nom: "Indigo", codeHex: "#4B0082", categorie: "froid" },
  { nom: "Prune", codeHex: "#8E4585", categorie: "froid" },

  // Couleurs vives
  { nom: "Rose", codeHex: "#FFC0CB", categorie: "vif" },
  { nom: "Rose Fuchsia", codeHex: "#FF00FF", categorie: "vif" },
  { nom: "Rose Vif", codeHex: "#FF1493", categorie: "vif" },
  { nom: "Magenta", codeHex: "#FF00FF", categorie: "vif" },

  // Couleurs pastel
  { nom: "Rose Poudré", codeHex: "#FFD1DC", categorie: "pastel" },
  { nom: "Bleu Pastel", codeHex: "#AEC6CF", categorie: "pastel" },
  { nom: "Vert Pastel", codeHex: "#77DD77", categorie: "pastel" },
  { nom: "Jaune Pastel", codeHex: "#FDFD96", categorie: "pastel" },
  { nom: "Pêche", codeHex: "#FFDAB9", categorie: "pastel" },

  // Couleurs métalliques
  { nom: "Argent", codeHex: "#C0C0C0", categorie: "metallique" },
  { nom: "Doré", codeHex: "#DAA520", categorie: "metallique" },
  { nom: "Cuivré", codeHex: "#B87333", categorie: "metallique" },
  { nom: "Bronze", codeHex: "#CD7F32", categorie: "metallique" },

  // Couleurs fluo
  { nom: "Vert Fluo", codeHex: "#39FF14", categorie: "fluo" },
  { nom: "Rose Fluo", codeHex: "#FF1493", categorie: "fluo" },
  { nom: "Jaune Fluo", codeHex: "#CCFF00", categorie: "fluo" },
  { nom: "Orange Fluo", codeHex: "#FF5F1F", categorie: "fluo" },
];

// Données de seed pour les marques
const marquesData = [
  { nom: "Nike", slug: "nike" },
  { nom: "Adidas", slug: "adidas" },
  { nom: "Puma", slug: "puma" },
  { nom: "Reebok", slug: "reebok" },
  { nom: "Under Armour", slug: "under-armour" },
  { nom: "New Balance", slug: "new-balance" },
  { nom: "Converse", slug: "converse" },
  { nom: "Vans", slug: "vans" },
  { nom: "Levi's", slug: "levis" },
  { nom: "Zara", slug: "zara" },
  { nom: "H&M", slug: "hm" },
  { nom: "Uniqlo", slug: "uniqlo" },
  { nom: "Gap", slug: "gap" },
  { nom: "Lacoste", slug: "lacoste" },
  { nom: "Ralph Lauren", slug: "ralph-lauren" },
  { nom: "Calvin Klein", slug: "calvin-klein" },
  { nom: "Tommy Hilfiger", slug: "tommy-hilfiger" },
  { nom: "Gucci", slug: "gucci" },
  { nom: "Prada", slug: "prada" },
  { nom: "Louis Vuitton", slug: "louis-vuitton" },
  { nom: "Chanel", slug: "chanel" },
  { nom: "Dior", slug: "dior" },
  { nom: "Hermès", slug: "hermes" },
  { nom: "Versace", slug: "versace" },
  { nom: "Armani", slug: "armani" },
];

async function seedTypesUnites() {
  console.log("📦 Seed des types d'unités...");

  for (const typeData of typesUnitesData) {
    const existing = await TypeUnite.findOne({ nom: typeData.nom });
    if (!existing) {
      await TypeUnite.create(typeData);
      console.log(`  ✓ Type d'unité créé: ${typeData.label}`);
    } else {
      console.log(`  - Type d'unité déjà existant: ${typeData.label}`);
    }
  }
}

async function seedCouleurs() {
  console.log("🎨 Seed des couleurs...");

  for (const couleurData of couleursData) {
    const existing = await Couleur.findOne({ codeHex: couleurData.codeHex });
    if (!existing) {
      await Couleur.create(couleurData);
      console.log(
        `  ✓ Couleur créée: ${couleurData.nom} (${couleurData.codeHex})`,
      );
    } else {
      console.log(`  - Couleur déjà existante: ${couleurData.nom}`);
    }
  }
}

async function seedTailles() {
  console.log("📏 Seed des tailles...");

  const typesUnites = await TypeUnite.find();

  for (const typeUnite of typesUnites) {
    const valeurs = typeUnite.valeurs || [];

    for (let i = 0; i < valeurs.length; i++) {
      const valeur = valeurs[i];
      const existing = await Taille.findOne({
        valeur: valeur.toLowerCase(),
        typeUnite: typeUnite._id,
      });

      if (!existing) {
        await Taille.create({
          valeur: valeur.toLowerCase(),
          label: valeur,
          typeUnite: typeUnite._id,
          ordre: i,
          estStandard: i < 7, // Les 7 premières sont standards
        });
        console.log(`  ✓ Taille créée: ${valeur} (${typeUnite.label})`);
      }
    }
  }
}

async function seedMarques() {
  console.log("🏷️ Seed des marques...");

  for (const marqueData of marquesData) {
    const existing = await Marque.findOne({ nom: marqueData.nom });
    if (!existing) {
      await Marque.create(marqueData);
      console.log(`  ✓ Marque créée: ${marqueData.nom}`);
    } else {
      console.log(`  - Marque déjà existante: ${marqueData.nom}`);
    }
  }
}

async function runSeed() {
  try {
    console.log("🌱 Démarrage du seed des attributs de produits...\n");

    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connecté à MongoDB\n");

    // Exécution des seeds
    await seedTypesUnites();
    console.log();

    await seedCouleurs();
    console.log();

    await seedTailles();
    console.log();

    await seedMarques();
    console.log();

    console.log("✅ Seed terminé avec succès !");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors du seed:", error);
    process.exit(1);
  }
}

runSeed();
