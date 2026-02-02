const jwt = require('jsonwebtoken');

// Générer un token JWT
const genererToken = (utilisateurId) => {
  return jwt.sign(
    { id: utilisateurId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};

// Vérifier un token JWT
const verifierToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Token invalide');
  }
};

// Extraire le token de l'en-tête Authorization
const extraireToken = (req) => {
  const authHeader = req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

module.exports = {
  genererToken,
  verifierToken,
  extraireToken
};