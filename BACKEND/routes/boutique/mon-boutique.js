const express = require("express");
const router = express.Router();
const { authentification } = require("../../middleware/auth");
const Boutique = require("../../models/admin/Boutique");
const Utilisateur = require("../../models/Utilisateur");

// GET /api/boutique/mon-boutique
router.get("/", authentification, async (req, res) => {
  try {
    const boutique = await Boutique.findOne({ "contact.email": req.utilisateur.email })
      .populate({
        path: "appel_offre_id",
        populate: {
          path: "emplacement_id",
          populate: {
            path: "etage_id",
            populate: {
              path: "batiment_id",
              populate: { path: "centre_id" },
            },
          },
        },
      });

    if (!boutique) {
      return res.status(404).json({ success: false, message: "Boutique introuvable pour cet utilisateur" });
    }

    res.json({ success: true, data: boutique });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/boutique/mon-boutique/profil
// Met à jour les infos du vendeur (nom, prenom, telephone) dans Utilisateur ET Boutique.contact
router.put("/profil", authentification, async (req, res) => {
  try {
    const { nom, prenom, telephone } = req.body;

    if (!nom || !prenom) {
      return res.status(400).json({ success: false, message: "Le nom et le prénom sont requis." });
    }

    // 1. Mettre à jour l'Utilisateur
    const utilisateur = await Utilisateur.findById(req.utilisateur._id);
    if (!utilisateur) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    }
    utilisateur.nom = nom.trim();
    utilisateur.prenom = prenom.trim();
    if (telephone !== undefined) utilisateur.telephone = telephone.trim();
    await utilisateur.save();

    // 2. Mettre à jour le contact de la Boutique
    const updateContact = { "contact.nom": nom.trim(), "contact.prenom": prenom.trim() };
    if (telephone !== undefined) updateContact["contact.telephone"] = telephone.trim();

    await Boutique.findOneAndUpdate(
      { "contact.email": req.utilisateur.email },
      { $set: updateContact }
    );

    res.json({ success: true, message: "Informations mises à jour avec succès." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
