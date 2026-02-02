const express = require("express");
const router = express.Router();
const { authentification, verifierRole } = require("../../middleware/auth");

// Appliquer l'authentification et vérification du rôle admin à toutes les routes
router.use(authentification);
router.use(verifierRole("admin"));

router.use("/logs", require("./logs"));
router.use("/centres", require("./centres"));
router.use("/batiments", require("./batiments"));
router.use("/etages", require("./etages"));
router.use("/emplacements", require("./emplacements"));
router.use("/appels-offre", require("./appelsOffre"));
router.use("/boutiques", require("./boutiques"));

module.exports = router;
