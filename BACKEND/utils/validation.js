// Fonction utilitaire pour vérifier si un mot de passe est trop facile
function motDePasseFacile(password) {
  const easyPasswords = [
    "vvvvvvv",
    "123456",
    "password",
    "azerty",
    "qwerty",
    "abcdef",
    "000000",
    "111111",
  ];
  if (easyPasswords.includes(password.toLowerCase())) return true;
  // Ajoute d'autres critères simples
  if (/^(.)\1{5,}$/.test(password)) return true; // ex: aaaaaaa
  if (password.length < 8) return false; // déjà géré par isLength
  return false;
}
const { body, validationResult } = require("express-validator");

// Validation pour l'inscription
const validerInscription = [
  body("email").isEmail().withMessage("Email invalide").normalizeEmail(),
  body("mot_de_passe")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caractères")
    .custom((value) => {
      if (motDePasseFacile(value)) {
        throw new Error("Mot de passe trop facile");
      }
      return true;
    }),
  body("prenom")
    .trim()
    .notEmpty()
    .withMessage("Le prénom est requis")
    .isLength({ max: 50 })
    .withMessage("Le prénom ne peut pas dépasser 50 caractères"),
  body("nom")
    .trim()
    .notEmpty()
    .withMessage("Le nom est requis")
    .isLength({ max: 50 })
    .withMessage("Le nom ne peut pas dépasser 50 caractères"),
  body("telephone")
    .optional()
    .matches(/^[\d\s\+\-\(\)]+$/)
    .withMessage("Numéro de téléphone invalide"),
  body("role")
    .optional()
    .isIn(["admin", "boutique", "client"])
    .withMessage("Le rôle doit être admin, boutique ou client"),
];

// Validation pour la connexion
const validerConnexion = [
  body("email").isEmail().withMessage("Email invalide").normalizeEmail(),
  body("mot_de_passe").notEmpty().withMessage("Le mot de passe est requis"),
];

// Validation pour la mise à jour du profil
const validerMiseAJourProfil = [
  body("email")
    .optional()
    .isEmail()
    .withMessage("Email invalide")
    .normalizeEmail()
    .toLowerCase(),
  body("prenom")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Le prénom ne peut pas être vide")
    .isLength({ max: 50 })
    .withMessage("Le prénom ne peut pas dépasser 50 caractères"),
  body("nom")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Le nom ne peut pas être vide")
    .isLength({ max: 50 })
    .withMessage("Le nom ne peut pas dépasser 50 caractères"),
  body("telephone")
    .optional()
    .matches(/^[\d\s\+\-\(\)]+$/)
    .withMessage("Numéro de téléphone invalide"),
];

// Validation pour le changement de mot de passe
const validerChangementMotDePasse = [
  body("ancien_mot_de_passe")
    .notEmpty()
    .withMessage("L'ancien mot de passe est requis"),
  body("nouveau_mot_de_passe")
    .isLength({ min: 6 })
    .withMessage("Le nouveau mot de passe doit contenir au moins 6 caractères")
    .custom((value) => {
      if (motDePasseFacile(value)) {
        throw new Error("Mot de passe trop facile");
      }
      return true;
    }),
  body("confirmer_mot_de_passe").custom((value, { req }) => {
    if (value !== req.body.nouveau_mot_de_passe) {
      throw new Error("La confirmation du mot de passe ne correspond pas");
    }
    return true;
  }),
];

// Validation pour la demande de réinitialisation
const validerDemandeReinitialisation = [
  body("email")
    .isEmail()
    .withMessage("Email invalide")
    .normalizeEmail()
    .toLowerCase(),
];

// Validation pour la réinitialisation de mot de passe
const validerReinitialisationMotDePasse = [
  body("token").notEmpty().withMessage("Token de réinitialisation requis"),
  body("nouveau_mot_de_passe")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caractères")
    .custom((value) => {
      if (motDePasseFacile(value)) {
        throw new Error("Mot de passe trop facile");
      }
      return true;
    }),
];

// Middleware pour gérer les erreurs de validation
const gererErreursValidation = (req, res, next) => {
  const erreurs = validationResult(req);
  if (!erreurs.isEmpty()) {
    const facile = erreurs
      .array()
      .find((e) => e.msg === "Mot de passe trop facile");
    if (facile) {
      return res.status(400).json({
        erreur: "Mot de passe trop facile",
        details: erreurs.array(),
      });
    }
    return res.status(400).json({
      erreur: "Données invalides",
      details: erreurs.array(),
    });
  }
  next();
};

module.exports = {
  validerInscription,
  validerConnexion,
  validerMiseAJourProfil,
  validerChangementMotDePasse,
  validerDemandeReinitialisation,
  validerReinitialisationMotDePasse,
  gererErreursValidation,
};
