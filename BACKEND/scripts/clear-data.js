/**
 * Script de nettoyage de la base de données
 * Efface toutes les collections SAUF la collection "utilisateurs"
 *
 * Usage:
 *   node scripts/clear-data.js
 *
 * Pour forcer sans confirmation:
 *   node scripts/clear-data.js --force
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const readline = require("readline");

// Import de tous les modèles (nécessaire pour que Mongoose les enregistre)
require("../models/admin/AppelOffre");
require("../models/admin/Batiment");
require("../models/admin/Boutique");
require("../models/admin/Centre");
require("../models/admin/Emplacement");
require("../models/admin/Etage");
require("../models/admin/Logs");
require("../models/admin/ReponseAppelOffre");
require("../models/boutique/Categorie");
require("../models/boutique/Commande");
require("../models/boutique/Couleur");
require("../models/boutique/Marque");
require("../models/boutique/MouvementStock");
require("../models/boutique/Produit");
require("../models/boutique/Taille");
require("../models/boutique/TypeUnite");

// Collections à effacer (toutes sauf "utilisateurs")
const COLLECTIONS_TO_CLEAR = [
  "appeloffres",
  "batiments",
  "boutiques",
  "centres",
  "emplacements",
  "etages",
  "logs",
  "reponseappeloffres",
  "categories",
  "commandes",
  "couleurs",
  "marques",
  "mouvementstocks",
  "produits",
  "tailles",
  "typeunites",
];

async function clearCollections() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error("❌  MONGO_URI non défini dans .env");
    process.exit(1);
  }

  console.log("\n🔗  Connexion à MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connecté :", mongoose.connection.name, "\n");

  const db = mongoose.connection.db;

  // Récupérer les collections réellement présentes dans la base
  const existingCollections = (await db.listCollections().toArray()).map(
    (c) => c.name,
  );

  console.log(
    "📋  Collections présentes :",
    existingCollections.join(", "),
    "\n",
  );
  console.log(
    "⚠️   Collections qui seront effacées (utilisateurs préservés) :",
  );

  const toClear = COLLECTIONS_TO_CLEAR.filter((c) =>
    existingCollections.includes(c),
  );
  const notFound = COLLECTIONS_TO_CLEAR.filter(
    (c) => !existingCollections.includes(c),
  );

  toClear.forEach((c) => console.log(`   🗑️  ${c}`));
  if (notFound.length)
    notFound.forEach((c) => console.log(`   ⬜  ${c} (déjà vide/absente)`));

  console.log("\n🔒  Préservé : utilisateurs\n");

  // Effacement
  let total = 0;
  for (const name of toClear) {
    const result = await db.collection(name).deleteMany({});
    console.log(
      `   ✅  ${name} — ${result.deletedCount} document(s) supprimé(s)`,
    );
    total += result.deletedCount;
  }

  console.log(`\n🎉  Terminé — ${total} document(s) supprimé(s) au total.`);
  console.log('🔒  La collection "utilisateurs" est intacte.\n');

  await mongoose.disconnect();
  process.exit(0);
}

async function confirm(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

(async () => {
  const force = process.argv.includes("--force");

  if (!force) {
    const answer = await confirm(
      "⚠️   Êtes-vous sûr de vouloir effacer toutes les données (sauf utilisateurs) ? [oui/non] : ",
    );
    if (answer !== "oui" && answer !== "o") {
      console.log("❌  Annulé.");
      process.exit(0);
    }
  }

  clearCollections().catch((err) => {
    console.error("❌  Erreur :", err.message);
    process.exit(1);
  });
})();
