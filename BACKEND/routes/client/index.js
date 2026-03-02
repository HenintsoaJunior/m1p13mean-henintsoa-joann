const express = require("express");
const router = express.Router();
const { authentification, interdireAccesInterdit } = require("../../middleware/auth");
const CommandeService = require("../../services/boutique/CommandeService");
const Boutique = require("../../models/admin/Boutique");

// Auth middleware
router.use(authentification);
router.use(interdireAccesInterdit);
router.use((req, res, next) => {
  if (!req.utilisateur) {
    return res.status(401).json({ erreur: "Accès refusé. Utilisateur non authentifié." });
  }
  if (["client", "admin", "boutique"].includes(req.utilisateur.role)) {
    next();
  } else {
    return res.status(403).json({ erreur: "Accès refusé. Permissions insuffisantes." });
  }
});

router.get("/", (req, res) => {
  res.json({ message: "Accès client autorisé", utilisateur: req.utilisateur });
});

// POST /api/client/commandes — passer une commande depuis le panier
router.post("/commandes", async (req, res) => {
  try {
    const { lignes, notes, adresse } = req.body;
    if (!lignes || !Array.isArray(lignes) || lignes.length === 0) {
      return res.status(400).json({ success: false, message: "Le panier est vide." });
    }

    // Récupérer idBoutique depuis le premier produit (tous les items du panier viennent de la même boutique)
    const Produit = require("../../models/boutique/Produit");
    const premierProduit = await Produit.findById(lignes[0].idProduit);
    if (!premierProduit) return res.status(404).json({ success: false, message: "Produit introuvable." });
    const idBoutique = premierProduit.idBoutique;

    const commandeService = new CommandeService();
    const commande = await commandeService.creerCommande({
      client: {
        nom: req.utilisateur.nom || "",
        prenom: req.utilisateur.prenom || "",
        email: req.utilisateur.email || "",
        telephone: req.utilisateur.telephone || "",
        adresse: adresse || "",
      },
      lignes,
      notes,
    }, idBoutique);

    res.status(201).json({ success: true, data: commande });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/client/commandes — historique des commandes du client
router.get("/commandes", async (req, res) => {
  try {
    const Commande = require("../../models/boutique/Commande");
    const commandes = await Commande.find({ "client.email": req.utilisateur.email })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: commandes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;