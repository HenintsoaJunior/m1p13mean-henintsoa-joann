const Marque = require("../../models/boutique/Marque");

class MarqueRepository {
  /**
   * Repository pour l'accès aux données des marques
   */

  /**
   * Créer une nouvelle marque
   * @param {Object} donnees - Données de la marque
   * @returns {Promise<Object>} Marque créée
   */
  async creer(donnees) {
    const marque = new Marque(donnees);
    await marque.save();
    return marque;
  }

  /**
   * Trouver une marque par ID
   * @param {string} id - ID de la marque
   * @returns {Promise<Object|null>} Marque trouvée ou null
   */
  async trouverParId(id) {
    return await Marque.findById(id);
  }

  /**
   * Trouver une marque par slug
   * @param {string} slug - Slug de la marque
   * @returns {Promise<Object|null>} Marque trouvée ou null
   */
  async trouverParSlug(slug) {
    return await Marque.findOne({ slug: slug.toLowerCase().trim() });
  }

  /**
   * Trouver une marque par nom
   * @param {string} nom - Nom de la marque
   * @returns {Promise<Object|null>} Marque trouvée ou null
   */
  async trouverParNom(nom) {
    return await Marque.findOne({ nom: new RegExp(`^${nom}$`, "i") });
  }

  /**
   * Trouver toutes les marques
   * @returns {Promise<Array>} Liste des marques
   */
  async trouverToutes() {
    return await Marque.find().sort({ nom: 1 });
  }

  /**
   * Trouver les marques actives
   * @returns {Promise<Array>} Liste des marques actives
   */
  async trouverActives() {
    return await Marque.find({ estActif: true }).sort({ nom: 1 });
  }

  /**
   * Mettre à jour une marque
   * @param {Object} marque - Instance de la marque
   * @returns {Promise<Object>} Marque mise à jour
   */
  async mettreAJour(marque) {
    await marque.save();
    return marque;
  }

  /**
   * Supprimer une marque
   * @param {string} id - ID de la marque
   * @returns {Promise<Object>} Marque supprimée
   */
  async supprimer(id) {
    return await Marque.findByIdAndDelete(id);
  }

  /**
   * Rechercher des marques par terme
   * @param {string} terme - Terme de recherche
   * @returns {Promise<Array>} Liste des marques trouvées
   */
  async rechercher(terme) {
    return await Marque.find({
      $or: [
        { nom: { $regex: terme, $options: "i" } },
        { slug: { $regex: terme, $options: "i" } },
      ],
      estActif: true,
    }).limit(20);
  }
}

module.exports = MarqueRepository;
