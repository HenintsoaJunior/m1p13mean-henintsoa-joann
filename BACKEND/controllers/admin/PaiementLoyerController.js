const PaiementLoyerService = require("../../services/boutique/PaiementLoyerService");
const Boutique = require("../../models/admin/Boutique");
const PaiementLoyer = require("../../models/boutique/PaiementLoyer");

const paiementService = new PaiementLoyerService();

// GET /api/admin/paiements
// Liste tous les paiements (avec filtres optionnels)
const getTousPaiements = async (req, res) => {
  try {
    const { statut, boutique_id, mois_loyer, page = 1, limit = 20 } = req.query;
    const filtres = {};
    if (statut) filtres.statut = statut;
    if (boutique_id) filtres.boutique_id = boutique_id;
    if (mois_loyer) filtres.mois_loyer = mois_loyer;

    const data = await paiementService.getTousPaiements(filtres, parseInt(page), parseInt(limit));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/paiements/boutiques-statut
// Liste toutes les boutiques actives avec le statut du loyer du mois courant
const getBoutiquesStatutLoyer = async (req, res) => {
  try {
    const moisQuery = req.query.mois_loyer;
    const now = new Date();
    const moisCourant = moisQuery || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const boutiques = await Boutique.find({ statut: "active" })
      .populate({
        path: "appel_offre_id",
        populate: { path: "emplacement_id", select: "loyer_mensuel nom code" },
      })
      .lean();

    const boutiqueIds = boutiques.map((b) => b._id);
    const paiements = await PaiementLoyer.find({
      boutique_id: { $in: boutiqueIds },
      mois_loyer: moisCourant,
    }).lean();

    const paiementsMap = {};
    paiements.forEach((p) => {
      paiementsMap[p.boutique_id.toString()] = p;
    });

    const result = boutiques.map((boutique) => {
      const paiement = paiementsMap[boutique._id.toString()] || null;
      const emplacement = boutique.appel_offre_id?.emplacement_id;
      return {
        boutique_id: boutique._id,
        nom: boutique.contact?.nom,
        email: boutique.contact?.email,
        emplacement: emplacement ? { nom: emplacement.nom, code: emplacement.code } : null,
        loyer_mensuel: emplacement?.loyer_mensuel || 0,
        mois_loyer: moisCourant,
        statut_paiement: paiement?.statut || "non_paye",
        paiement: paiement,
      };
    });

    const stats = {
      total: result.length,
      payes: result.filter((b) => b.statut_paiement === "paye").length,
      en_attente: result.filter((b) => b.statut_paiement === "en_attente").length,
      non_payes: result.filter((b) => b.statut_paiement === "non_paye").length,
      echoues: result.filter((b) => b.statut_paiement === "echoue").length,
    };

    res.json({ success: true, data: { boutiques: result, stats, mois_loyer: moisCourant } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTousPaiements, getBoutiquesStatutLoyer };
