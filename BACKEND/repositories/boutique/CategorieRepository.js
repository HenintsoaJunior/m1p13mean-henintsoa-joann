const Categorie = require("../../models/boutique/Categorie");

class CategorieRepository {
  /**
   * Repository pour l'accès aux données des catégories
   * Abstraction de la couche de données
   */

  /**
   * Créer une nouvelle catégorie
   * @param {Object} donneesCategorie - Données de la catégorie
   * @returns {Promise<Object>} Catégorie créée
   */
  async creer(donneesCategorie) {
    const categorie = new Categorie(donneesCategorie);
    await categorie.save();
    return categorie;
  }

  /**
   * Trouver une catégorie par ID
   * @param {string} id - ID de la catégorie
   * @returns {Promise<Object|null>} Catégorie trouvée ou null
   */
  async trouverParId(id) {
    return await Categorie.findById(id);
  }

  /**
   * Trouver une catégorie par slug
   * @param {string} slug - Slug de la catégorie
   * @returns {Promise<Object|null>} Catégorie trouvée ou null
   */
  async trouverParSlug(slug) {
    return await Categorie.findOne({ slug: slug.toLowerCase().trim() });
  }

  /**
   * Trouver toutes les catégories d'une boutique
   * @param {string} idBoutique - ID de la boutique
   * @returns {Promise<Array>} Liste des catégories
   */
  async trouverParBoutique(idBoutique) {
    return await Categorie.find({ idBoutique }).sort({ nom: 1 });
  }

  /**
   * Trouver les catégories enfants d'une catégorie parent
   * @param {string} idCategorieParent - ID de la catégorie parent
   * @returns {Promise<Array>} Liste des catégories enfants
   */
  async trouverEnfants(idCategorieParent) {
    return await Categorie.find({ idCategorieParent }).sort({ nom: 1 });
  }

  /**
   * Mettre à jour une catégorie
   * @param {Object} categorie - Instance de la catégorie
   * @returns {Promise<Object>} Catégorie mise à jour
   */
  async mettreAJour(categorie) {
    await categorie.save();
    return categorie;
  }

  /**
   * Supprimer une catégorie
   * @param {string} id - ID de la catégorie
   * @returns {Promise<Object>} Catégorie supprimée
   */
  async supprimer(id) {
    return await Categorie.findByIdAndDelete(id);
  }

  /**
   * Obtenir une liste paginée de catégories
   * @param {Object} filtres - Filtres de recherche
   * @param {Object} pagination - Options de pagination
   * @returns {Promise<Object>} Résultat avec catégories et pagination
   */
  async obtenirListeAvecPagination(filtres = {}, pagination = {}) {
    const { page = 1, limite = 10 } = pagination;
    const { idBoutique, idCategorieParent } = filtres;

    const filtreQuery = {};
    if (idBoutique) {
      filtreQuery.idBoutique = idBoutique;
    }
    if (idCategorieParent !== undefined) {
      filtreQuery.idCategorieParent = idCategorieParent === null ? null : idCategorieParent;
    }

    const [categories, total] = await Promise.all([
      Categorie.find(filtreQuery)
        .limit(parseInt(limite))
        .skip((parseInt(page) - 1) * parseInt(limite))
        .sort({ nom: 1 }),
      Categorie.countDocuments(filtreQuery),
    ]);

    return {
      categories,
      pagination: {
        page: parseInt(page),
        limite: parseInt(limite),
        total,
        pages: Math.ceil(total / parseInt(limite)),
      },
    };
  }

  /**
   * Vérifier si un slug existe déjà pour une boutique
   * @param {string} slug - Slug à vérifier
   * @param {string} idBoutique - ID de la boutique
   * @param {string} excludeId - ID à exclure de la vérification
   * @returns {Promise<boolean>} True si le slug existe
   */
  async slugExiste(slug, idBoutique, excludeId = null) {
    const query = { slug: slug.toLowerCase().trim(), idBoutique };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const categorie = await Categorie.findOne(query);
    return !!categorie;
  }
}

module.exports = CategorieRepository;
