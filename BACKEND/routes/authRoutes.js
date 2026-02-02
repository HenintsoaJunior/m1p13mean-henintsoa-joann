const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");
const {
  authentification,
  verifierRole,
  verifierProprietaire,
} = require("../middleware/auth");
const {
  validerInscription,
  validerConnexion,
  validerMiseAJourProfil,
  validerChangementMotDePasse,
  validerDemandeReinitialisation,
  validerReinitialisationMotDePasse,
  gererErreursValidation,
} = require("../utils/validation");

// Instance du contrôleur
const authController = new AuthController();

// @route   POST /auth/inscription
// @desc    Inscription d'un nouvel utilisateur
// @access  Public
router.post(
  "/inscription",
  validerInscription,
  gererErreursValidation,
  authController.inscription.bind(authController),
);

// @route   POST /auth/connexion
// @desc    Connexion d'un utilisateur
// @access  Public
router.post(
  "/connexion",
  validerConnexion,
  gererErreursValidation,
  authController.connexion.bind(authController),
);

// @route   GET /auth/profil
// @desc    Obtenir le profil de l'utilisateur connecté
// @access  Private
router.get(
  "/profil",
  authentification,
  authController.obtenirProfil.bind(authController),
);

// @route   PUT /auth/profil
// @desc    Mettre à jour le profil de l'utilisateur connecté
// @access  Private
router.put(
  "/profil",
  authentification,
  validerMiseAJourProfil,
  gererErreursValidation,
  authController.mettreAJourProfil.bind(authController),
);

// @route   PUT /auth/changer-mot-de-passe
// @desc    Changer le mot de passe de l'utilisateur connecté
// @access  Private
router.put(
  "/changer-mot-de-passe",
  authentification,
  validerChangementMotDePasse,
  gererErreursValidation,
  authController.changerMotDePasse.bind(authController),
);

// @route   POST /auth/demander-reinitialisation
// @desc    Demander la réinitialisation du mot de passe
// @access  Public
router.post(
  "/demander-reinitialisation",
  validerDemandeReinitialisation,
  gererErreursValidation,
  authController.demanderReinitialisationMotDePasse.bind(authController),
);

// @route   POST /auth/reinitialiser-mot-de-passe
// @desc    Réinitialiser le mot de passe avec le token
// @access  Public
router.post(
  "/reinitialiser-mot-de-passe",
  validerReinitialisationMotDePasse,
  gererErreursValidation,
  authController.reinitialiserMotDePasse.bind(authController),
);

// @route   GET /auth/utilisateurs
// @desc    Obtenir la liste des utilisateurs (Admin seulement)
// @access  Private/Admin
router.get(
  "/utilisateurs",
  authentification,
  verifierRole("admin"),
  authController.obtenirListeUtilisateurs.bind(authController),
);

// @route   PUT /auth/utilisateurs/:id/statut
// @desc    Activer/désactiver un utilisateur (Admin seulement)
// @access  Private/Admin
router.put(
  "/utilisateurs/:id/statut",
  authentification,
  verifierRole("admin"),
  authController.modifierStatutUtilisateur.bind(authController),
);

module.exports = router;
