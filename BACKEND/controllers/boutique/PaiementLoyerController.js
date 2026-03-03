const Boutique = require("../../models/admin/Boutique");
const PaiementLoyerService = require("../../services/boutique/PaiementLoyerService");

const paiementService = new PaiementLoyerService();

// POST /api/boutique/paiements/creer-intent
// Crée un PaymentIntent Stripe pour le loyer
const creerIntent = async (req, res) => {
  try {
    const { mois_loyer } = req.body;

    if (!mois_loyer || !/^\d{4}-\d{2}$/.test(mois_loyer)) {
      return res.status(400).json({ success: false, message: "Format mois invalide (YYYY-MM)" });
    }

    // Récupérer la boutique de l'utilisateur connecté
    const boutique = await Boutique.findOne({ "contact.email": req.utilisateur.email })
      .populate({
        path: "appel_offre_id",
        populate: { path: "emplacement_id", select: "loyer_mensuel nom code" },
      });

    if (!boutique) {
      return res.status(404).json({ success: false, message: "Boutique introuvable" });
    }

    const emplacement = boutique.appel_offre_id?.emplacement_id;
    if (!emplacement || !emplacement.loyer_mensuel) {
      return res.status(400).json({ success: false, message: "Emplacement ou montant du loyer introuvable" });
    }

    const { clientSecret, paiement } = await paiementService.creerPaymentIntent(
      boutique._id,
      emplacement.loyer_mensuel,
      mois_loyer,
      emplacement._id
    );

    res.json({
      success: true,
      data: {
        clientSecret,
        montant: emplacement.loyer_mensuel,
        mois_loyer,
        emplacement: { nom: emplacement.nom, code: emplacement.code },
        paiement_id: paiement._id,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/boutique/paiements
// Historique des paiements de la boutique connectée
const getHistorique = async (req, res) => {
  try {
    const boutique = await Boutique.findOne({ "contact.email": req.utilisateur.email });
    if (!boutique) {
      return res.status(404).json({ success: false, message: "Boutique introuvable" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const data = await paiementService.getHistoriqueBoutique(boutique._id, page, limit);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/boutique/paiements/mois-courant
// Statut du loyer du mois courant
const getStatutMoisCourant = async (req, res) => {
  try {
    const boutique = await Boutique.findOne({ "contact.email": req.utilisateur.email })
      .populate({
        path: "appel_offre_id",
        populate: { path: "emplacement_id", select: "loyer_mensuel nom code" },
      });

    if (!boutique) {
      return res.status(404).json({ success: false, message: "Boutique introuvable" });
    }

    const now = new Date();
    const moisCourant = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const PaiementLoyer = require("../../models/boutique/PaiementLoyer");
    const paiement = await PaiementLoyer.findOne({
      boutique_id: boutique._id,
      mois_loyer: moisCourant,
    });

    const emplacement = boutique.appel_offre_id?.emplacement_id;

    res.json({
      success: true,
      data: {
        mois_courant: moisCourant,
        montant_loyer: emplacement?.loyer_mensuel || 0,
        emplacement: emplacement ? { nom: emplacement.nom, code: emplacement.code } : null,
        paiement: paiement || null,
        statut: paiement?.statut || "non_paye",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { creerIntent, getHistorique, getStatutMoisCourant };
