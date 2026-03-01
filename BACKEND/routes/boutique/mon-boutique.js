const express = require("express");
const router = express.Router();
const { authentification } = require("../../middleware/auth");
const Boutique = require("../../models/admin/Boutique");

// GET /api/boutique/mon-boutique
// Retourne la boutique du user connecté avec la chaîne complète
// Boutique → AppelOffre → Emplacement → Etage → Batiment → Centre
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

module.exports = router;
