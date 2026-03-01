const Categorie = require("../../models/boutique/Categorie");

class CategorieRepository {
  /**
   * Repository pour l'accès aux données des catégories
   * Abstraction de la couche de données
   */

  /**
   * Créer une nouvelle catégorie
   */
  async creer(donneesCategorie) {
    const categorie = new Categorie(donneesCategorie);
    await categorie.save();
    return categorie;
  }

  /**
   * Trouver une catégorie par ID
   */
  async trouverParId(id) {
    return await Categorie.findById(id);
  }

  /**
   * Trouver une catégorie par slug
   */
  async trouverParSlug(slug) {
    return await Categorie.findOne({ slug: slug.toLowerCase().trim() });
  }

  /**
   * Trouver toutes les catégories d'une boutique
   */
  async trouverParBoutique(idBoutique) {
    return await Categorie.find({ idBoutique }).sort({ nom: 1 });
  }

  /**
   * Trouver toutes les catégories (global - toutes les boutiques)
   */
  async trouverToutes() {
    return await Categorie.find({}).sort({ nom: 1 });
  }

  /**
   * Trouver les catégories enfants d'une catégorie parent
   */
  async trouverEnfants(idCategorieParent) {
    return await Categorie.find({ idCategorieParent }).sort({ nom: 1 });
  }

  /**
   * Mettre à jour une catégorie
   */
  async mettreAJour(categorie) {
    await categorie.save();
    return categorie;
  }

  /**
   * Supprimer une catégorie
   */
  async supprimer(id) {
    return await Categorie.findByIdAndDelete(id);
  }

  /**
   * Obtenir une liste paginée de catégories
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
   */
  async slugExiste(slug, idBoutique, excludeId = null) {
    const query = { slug: slug.toLowerCase().trim(), idBoutique };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const categorie = await Categorie.findOne(query);
    return !!categorie;
  }

  /**
   * Vérifier si un slug existe déjà (global - toutes les boutiques)
   */
  async slugExisteGlobal(slug, excludeId = null) {
    const query = { slug: slug.toLowerCase().trim() };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const categorie = await Categorie.findOne(query);
    return !!categorie;
  }
}

module.exports = CategorieRepository;
