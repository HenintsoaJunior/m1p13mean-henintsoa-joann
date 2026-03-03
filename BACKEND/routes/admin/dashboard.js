const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Boutique = require("../../models/admin/Boutique");
const Emplacement = require("../../models/admin/Emplacement");
const AppelOffre = require("../../models/admin/AppelOffre");
const PaiementLoyer = require("../../models/boutique/PaiementLoyer");
const Utilisateur = require("../../models/Utilisateur");

router.get("/", async (req, res) => {
  try {
    const now = new Date();
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
    const moisCourant = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // --- KPIs ---
    const [
      totalBoutiquesActives,
      totalBoutiqueEnAttente,
      totalEmplacements,
      emplacementsOccupes,
      totalUtilisateurs,
    ] = await Promise.all([
      Boutique.countDocuments({ statut: "active" }),
      Boutique.countDocuments({ statut: "en_attente" }),
      Emplacement.countDocuments(),
      Emplacement.countDocuments({ statut: "occupe" }),
      Utilisateur.countDocuments(),
    ]);

    // Loyers ce mois (total payés)
    const loyersMoisAgg = await PaiementLoyer.aggregate([
      { $match: { mois_loyer: moisCourant, statut: "paye" } },
      { $group: { _id: null, total: { $sum: "$montant" }, count: { $sum: 1 } } },
    ]);
    const loyersMoisTotal = loyersMoisAgg[0]?.total || 0;
    const loyersMoisCount = loyersMoisAgg[0]?.count || 0;

    const tauxOccupation = totalEmplacements > 0
      ? Math.round((emplacementsOccupes / totalEmplacements) * 100)
      : 0;

    // --- Boutiques par statut ---
    const boutiquesParStatut = await Boutique.aggregate([
      { $group: { _id: "$statut", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // --- Loyers des 6 derniers mois ---
    const loyersParMois = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const moisKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const agg = await PaiementLoyer.aggregate([
        { $match: { mois_loyer: moisKey } },
        {
          $group: {
            _id: "$statut",
            total: { $sum: "$montant" },
            count: { $sum: 1 },
          },
        },
      ]);
      const payes = agg.find((a) => a._id === "paye") || { total: 0, count: 0 };
      const enAttente = agg.find((a) => a._id === "en_attente") || { total: 0, count: 0 };
      loyersParMois.push({
        mois: moisKey,
        label: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
        montantPaye: payes.total,
        countPaye: payes.count,
        countEnAttente: enAttente.count,
      });
    }

    // --- Emplacements par type ---
    const emplacementsParType = await Emplacement.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // --- Appels d'offre par statut ---
    const appelsParStatut = await AppelOffre.aggregate([
      { $group: { _id: "$statut", count: { $sum: 1 } } },
    ]);

    // --- Dernières boutiques (10) ---
    const dernieresBoutiques = await Boutique.find()
      .sort({ _id: -1 })
      .limit(10)
      .populate({
        path: "appel_offre_id",
        populate: { path: "emplacement_id", select: "nom code" },
      })
      .lean();

    // --- Statut loyers mois courant (boutiques actives) ---
    const boutiquesActives = await Boutique.find({ statut: "active" })
      .populate({
        path: "appel_offre_id",
        select: "date_appel",
      })
      .lean();

    const paiementsMoisActuels = await PaiementLoyer.find({
      mois_loyer: moisCourant,
    }).lean();

    const paiementsMap = {};
    paiementsMoisActuels.forEach((p) => {
      paiementsMap[p.boutique_id.toString()] = p.statut;
    });

    const boutiquesEligibles = boutiquesActives.filter((b) => {
      const dateDebut = b.appel_offre_id?.date_appel;
      if (!dateDebut) return true;
      const debut = new Date(dateDebut);
      const debutMoisKey = `${debut.getFullYear()}-${String(debut.getMonth() + 1).padStart(2, "0")}`;
      return debutMoisKey <= moisCourant;
    });

    const loyersMoisStatut = {
      payes: boutiquesEligibles.filter((b) => paiementsMap[b._id.toString()] === "paye").length,
      en_attente: boutiquesEligibles.filter((b) => paiementsMap[b._id.toString()] === "en_attente").length,
      non_payes: boutiquesEligibles.filter((b) => !paiementsMap[b._id.toString()]).length,
      total: boutiquesEligibles.length,
    };

    res.json({
      kpis: {
        totalBoutiquesActives,
        totalBoutiqueEnAttente,
        totalEmplacements,
        emplacementsOccupes,
        tauxOccupation,
        loyersMoisTotal,
        loyersMoisCount,
        totalUtilisateurs,
      },
      boutiquesParStatut,
      loyersParMois,
      emplacementsParType,
      appelsParStatut,
      dernieresBoutiques,
      loyersMoisStatut,
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    res.status(500).json({ erreur: err.message });
  }
});

module.exports = router;
