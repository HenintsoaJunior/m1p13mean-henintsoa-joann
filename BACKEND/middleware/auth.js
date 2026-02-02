const jwt = require("jsonwebtoken");
const Utilisateur = require("../models/Utilisateur");

// Middleware d'authentification
const authentification = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        erreur: "Accès refusé. Token manquant.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const utilisateur = await Utilisateur.findById(decoded.id).select(
      "-mot_de_passe",
    );

    if (!utilisateur || !utilisateur.actif) {
      return res.status(401).json({
        erreur: "Accès refusé. Utilisateur non trouvé ou inactif.",
      });
    }

    req.utilisateur = utilisateur;
    next();
  } catch (error) {
    console.error("Erreur d'authentification:", error.message);
    res.status(401).json({
      erreur: "Token invalide.",
    });
  }
};

// Middleware pour vérifier les rôles
const verifierRole = (...roles) => {
  return (req, res, next) => {
    if (!req.utilisateur) {
      return res.status(401).json({
        erreur: "Accès refusé. Utilisateur non authentifié.",
      });
    }

    if (!roles.includes(req.utilisateur.role)) {
      return res.status(403).json({
        erreur: "Accès refusé. Permissions insuffisantes.",
      });
    }

    next();
  };
};

// Middleware pour vérifier que l'utilisateur accède à ses propres données
const verifierProprietaire = (req, res, next) => {
  const utilisateurId = req.params.id || req.params.utilisateurId;

  if (
    req.utilisateur.role !== "admin" &&
    req.utilisateur._id.toString() !== utilisateurId
  ) {
    return res.status(403).json({
      erreur: "Accès refusé. Vous ne pouvez accéder qu'à vos propres données.",
    });
  }

  next();
};

module.exports = {
  authentification,
  verifierRole,
  verifierProprietaire,
};
