const express = require("express");
const router = express.Router();
const { authentification } = require("../../middleware/auth");
const { creerIntent, getHistorique, getStatutMoisCourant } = require("../../controllers/boutique/PaiementLoyerController");

// Toutes les routes nécessitent une authentification
router.use(authentification);

// GET /api/boutique/paiements/mois-courant - Statut du loyer du mois courant
router.get("/mois-courant", getStatutMoisCourant);

// POST /api/boutique/paiements/creer-intent - Créer un PaymentIntent
router.post("/creer-intent", creerIntent);

// GET /api/boutique/paiements - Historique des paiements
router.get("/", getHistorique);

module.exports = router;
