const express = require("express");
const router = express.Router();
const { getTousPaiements, getBoutiquesStatutLoyer } = require("../../controllers/admin/PaiementLoyerController");

// Auth admin déjà appliqué dans routes/admin/index.js

// GET /api/admin/paiements/boutiques-statut - Boutiques + statut loyer
router.get("/boutiques-statut", getBoutiquesStatutLoyer);

// GET /api/admin/paiements - Tous les paiements
router.get("/", getTousPaiements);

module.exports = router;
