const TypeUnite = require("../../models/boutique/TypeUnite");

class TypeUniteRepository {
  /**
   * Repository pour l'accès aux données des types d'unités
   */

  /**
   * Créer un nouveau type d'unité
   * @param {Object} donnees - Données du type d'unité
   * @returns {Promise<Object>} Type d'unité créé
   */
  async creer(donnees) {
    const typeUnite = new TypeUnite(donnees);
    await typeUnite.save();
    return typeUnite;
  }

  /**
   * Trouver un type d'unité par ID
   * @param {string} id - ID du type d'unité
   * @returns {Promise<Object|null>} Type d'unité trouvé ou null
   */
  async trouverParId(id) {
    return await TypeUnite.findById(id);
  }

  /**
   * Trouver un type d'unité par nom
   * @param {string} nom - Nom du type d'unité
   * @returns {Promise<Object|null>} Type d'unité trouvé ou null
   */
  async trouverParNom(nom) {
    return await TypeUnite.findOne({ nom: nom.toLowerCase().trim() });
  }

  /**
   * Trouver tous les types d'unités
   * @returns {Promise<Array>} Liste des types d'unités
   */
  async trouverTous() {
    return await TypeUnite.find().sort({ nom: 1 });
  }

  /**
   * Trouver les types d'unités actifs
   * @returns {Promise<Array>} Liste des types d'unités actifs
   */
  async trouverActifs() {
    return await TypeUnite.find({ estActif: true }).sort({ nom: 1 });
  }

  /**
   * Mettre à jour un type d'unité
   * @param {Object} typeUnite - Instance du type d'unité
   * @returns {Promise<Object>} Type d'unité mis à jour
   */
  async mettreAJour(typeUnite) {
    await typeUnite.save();
    return typeUnite;
  }

  /**
   * Supprimer un type d'unité
   * @param {string} id - ID du type d'unité
   * @returns {Promise<Object>} Type d'unité supprimé
   */
  async supprimer(id) {
    return await TypeUnite.findByIdAndDelete(id);
  }

  /**
   * Ajouter une valeur à un type d'unité
   * @param {string} id - ID du type d'unité
   * @param {string} valeur - Valeur à ajouter
   * @returns {Promise<Object>} Type d'unité mis à jour
   */
  async ajouterValeur(id, valeur) {
    return await TypeUnite.findByIdAndUpdate(
      id,
      { $addToSet: { valeurs: valeur } },
      { new: true }
    );
  }

  /**
   * Supprimer une valeur d'un type d'unité
   * @param {string} id - ID du type d'unité
   * @param {string} valeur - Valeur à supprimer
   * @returns {Promise<Object>} Type d'unité mis à jour
   */
  async supprimerValeur(id, valeur) {
    return await TypeUnite.findByIdAndUpdate(
      id,
      { $pull: { valeurs: valeur } },
      { new: true }
    );
  }
}

module.exports = TypeUniteRepository;
