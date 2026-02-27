const express = require("express");
const router = express.Router();
const { authentification, verifierRole } = require("./../middleware/auth");
const reponseController = require("../controllers/admin/ReponseAppelOffreController");

// Création d'une réponse (ouverte à tous)
// note: aucun middleware d'authentification pour permettre aux non-connectés de soumettre
router.post("/", reponseController.createReponse.bind(reponseController));

// Lister les réponses pour un appel d'offre (boutique/admin)
router.get("/appel/:appelId", authentification, reponseController.getReponsesByAppel.bind(reponseController));

// Actions réservées admin : accepter / refuser
router.put("/:id/accept", authentification, verifierRole("admin"), reponseController.acceptReponse.bind(reponseController));
router.put("/:id/refuse", authentification, verifierRole("admin"), reponseController.refuseReponse.bind(reponseController));

module.exports = router;
