const Couleur = require("../../models/boutique/Couleur");

class CouleurRepository {
  /**
   * Repository pour l'accès aux données des couleurs
   */

  /**
   * Créer une nouvelle couleur
   * @param {Object} donnees - Données de la couleur
   * @returns {Promise<Object>} Couleur créée
   */
  async creer(donnees) {
    const couleur = new Couleur(donnees);
    await couleur.save();
    return couleur;
  }

  /**
   * Trouver une couleur par ID
   * @param {string} id - ID de la couleur
   * @returns {Promise<Object|null>} Couleur trouvée ou null
   */
  async trouverParId(id) {
    return await Couleur.findById(id);
  }

  /**
   * Trouver une couleur par code hexadécimal
   * @param {string} codeHex - Code hexadécimal
   * @returns {Promise<Object|null>} Couleur trouvée ou null
   */
  async trouverParCodeHex(codeHex) {
    return await Couleur.findOne({ codeHex: codeHex.toUpperCase().trim() });
  }

  /**
   * Trouver une couleur par nom
   * @param {string} nom - Nom de la couleur
   * @returns {Promise<Object|null>} Couleur trouvée ou null
   */
  async trouverParNom(nom) {
    return await Couleur.findOne({ nom: new RegExp(`^${nom}$`, "i") });
  }

  /**
   * Trouver toutes les couleurs
   * @returns {Promise<Array>} Liste des couleurs
   */
  async trouverToutes() {
    return await Couleur.find().sort({ nom: 1 });
  }

  /**
   * Trouver les couleurs actives
   * @returns {Promise<Array>} Liste des couleurs actives
   */
  async trouverActives() {
    return await Couleur.find({ estActif: true }).sort({ nom: 1 });
  }

  /**
   * Trouver les couleurs par catégorie
   * @param {string} categorie - Catégorie de couleur
   * @returns {Promise<Array>} Liste des couleurs
   */
  async trouverParCategorie(categorie) {
    return await Couleur.find({ categorie, estActif: true }).sort({ nom: 1 });
  }

  /**
   * Mettre à jour une couleur
   * @param {Object} couleur - Instance de la couleur
   * @returns {Promise<Object>} Couleur mise à jour
   */
  async mettreAJour(couleur) {
    await couleur.save();
    return couleur;
  }

  /**
   * Supprimer une couleur
   * @param {string} id - ID de la couleur
   * @returns {Promise<Object>} Couleur supprimée
   */
  async supprimer(id) {
    return await Couleur.findByIdAndDelete(id);
  }

  /**
   * Rechercher des couleurs par terme
   * @param {string} terme - Terme de recherche
   * @returns {Promise<Array>} Liste des couleurs trouvées
   */
  async rechercher(terme) {
    return await Couleur.find({
      $or: [
        { nom: { $regex: terme, $options: "i" } },
        { codeHex: { $regex: terme, $options: "i" } },
      ],
      estActif: true,
    }).limit(20);
  }
}

module.exports = CouleurRepository;
