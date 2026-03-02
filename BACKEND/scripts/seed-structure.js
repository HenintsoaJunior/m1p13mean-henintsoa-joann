const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const Centre = require("../models/admin/Centre");
const Batiment = require("../models/admin/Batiment");
const Etage = require("../models/admin/Etage");
const Emplacement = require("../models/admin/Emplacement");

async function seedStructure() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connecté à MongoDB");

    // 1. Créer un seul centre
    console.log("\n🏢 Création du centre...");
    const centre = await Centre.create({
      nom: "Centre Commercial Galaxy",
      slug: "centre-commercial-galaxy",
      adresse: {
        rue: "Avenue de l'Indépendance",
        ville: "Antananarivo",
        code_postal: "101",
        pays: "Madagascar",
        coordonnees: {
          type: "Point",
          coordinates: [47.52, -18.92],
        },
      },
      description: "Centre commercial moderne au cœur d'Antananarivo",
      image_url:
        "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=600&fit=crop",
      horaires_ouverture: {
        lundi: "08:00-20:00",
        mardi: "08:00-20:00",
        mercredi: "08:00-20:00",
        jeudi: "08:00-20:00",
        vendredi: "08:00-20:00",
        samedi: "09:00-21:00",
        dimanche: "09:00-18:00",
      },
      email_contact: "contact@galaxy-centre.mg",
      telephone_contact: "+261 34 00 000 00",
    });
    console.log(`✅ Centre créé: ${centre.nom}`);

    // 2. Créer plusieurs bâtiments
    console.log("\n🏗️  Création des bâtiments...");
    const batiments = await Batiment.insertMany([
      {
        centre_id: centre._id,
        nom: "Bâtiment A - Mode & Luxe",
        description: "Boutiques de mode et accessoires de luxe",
        nombre_etages: 3,
      },
      {
        centre_id: centre._id,
        nom: "Bâtiment B - Électronique & Tech",
        description: "Électronique, informatique et high-tech",
        nombre_etages: 2,
      },
      {
        centre_id: centre._id,
        nom: "Bâtiment C - Maison & Décoration",
        description: "Équipements pour la maison et décoration",
        nombre_etages: 2,
      },
    ]);
    batiments.forEach((b) => console.log(`✅ Bâtiment créé: ${b.nom}`));

    // 3. Créer des étages pour chaque bâtiment
    console.log("\n📊 Création des étages...");
    const etages = [];

    // Bâtiment A - 3 étages
    etages.push(
      ...(await Etage.insertMany([
        {
          batiment_id: batiments[0]._id,
          nom: "Rez-de-chaussée",
          niveau: 0,
          surface_totale_m2: 1500,
          hauteur_sous_plafond_m: 4.5,
        },
        {
          batiment_id: batiments[0]._id,
          nom: "1er Étage",
          niveau: 1,
          surface_totale_m2: 1500,
          hauteur_sous_plafond_m: 3.5,
        },
        {
          batiment_id: batiments[0]._id,
          nom: "2ème Étage",
          niveau: 2,
          surface_totale_m2: 1200,
          hauteur_sous_plafond_m: 3.5,
        },
      ])),
    );

    // Bâtiment B - 2 étages
    etages.push(
      ...(await Etage.insertMany([
        {
          batiment_id: batiments[1]._id,
          nom: "Rez-de-chaussée",
          niveau: 0,
          surface_totale_m2: 1800,
          hauteur_sous_plafond_m: 4.0,
        },
        {
          batiment_id: batiments[1]._id,
          nom: "1er Étage",
          niveau: 1,
          surface_totale_m2: 1800,
          hauteur_sous_plafond_m: 3.5,
        },
      ])),
    );

    // Bâtiment C - 2 étages
    etages.push(
      ...(await Etage.insertMany([
        {
          batiment_id: batiments[2]._id,
          nom: "Rez-de-chaussée",
          niveau: 0,
          surface_totale_m2: 1400,
          hauteur_sous_plafond_m: 4.0,
        },
        {
          batiment_id: batiments[2]._id,
          nom: "1er Étage",
          niveau: 1,
          surface_totale_m2: 1400,
          hauteur_sous_plafond_m: 3.5,
        },
      ])),
    );

    console.log(`✅ ${etages.length} étages créés`);

    // 4. Créer des emplacements pour chaque étage
    console.log("\n📍 Création des emplacements...");
    const emplacements = [];

    for (const etage of etages) {
      const batiment = batiments.find((b) => b._id.equals(etage.batiment_id));
      const typeEmplacements = ["box", "kiosque", "zone_loisirs", "pop_up"];

      // Créer 5-8 emplacements par étage
      const nombreEmplacements = Math.floor(Math.random() * 4) + 5;

      const emplacementsEtage = [];
      for (let i = 0; i < nombreEmplacements; i++) {
        emplacementsEtage.push({
          etage_id: etage._id,
          code: `${batiment.nom.split(" ")[2]}-R${etage.niveau}-E${String(i + 1).padStart(2, "0")}`,
          type: typeEmplacements[
            Math.floor(Math.random() * typeEmplacements.length)
          ],
          nom: `Emplacement ${String(i + 1).padStart(2, "0")}`,
          surface_m2: Math.floor(Math.random() * 80) + 20,
          position: {
            type: "polygone",
            coordonnees: [
              [
                [0, 0],
                [10, 0],
                [10, 10],
                [0, 10],
                [0, 0],
              ],
            ],
          },
          statut: ["libre", "occupe", "reserve"][Math.floor(Math.random() * 3)],
          loyer_mensuel: Math.floor(Math.random() * 500000) + 100000,
        });
      }

      emplacements.push(...(await Emplacement.insertMany(emplacementsEtage)));
    }

    console.log(`✅ ${emplacements.length} emplacements créés`);

    // Récapitulatif
    console.log("\n✅ Seed de la structure terminé avec succès!");
    console.log("\n--- Récapitulatif ---");
    console.log(`Centre: ${centre.nom}`);
    console.log(`Bâtiments: ${batiments.length}`);
    console.log(`Étages: ${etages.length}`);
    console.log(`Emplacements: ${emplacements.length}`);
    console.log("---------------------\n");

    await mongoose.disconnect();
    console.log("✅ Déconnecté de MongoDB");
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedStructure();
