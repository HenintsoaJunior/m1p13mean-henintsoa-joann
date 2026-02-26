const CategorieRepository = require("../../repositories/boutique/CategorieRepository");

class CategorieService {
  constructor() {
    this.categorieRepository = new CategorieRepository();
  }

  /**
   * Service pour la logique métier des catégories
   * Pure logique métier, indépendant de la base de données
   */

  /**
   * Créer une nouvelle catégorie
   * @param {Object} donneesCategorie - Données de la catégorie
   * @returns {Promise<Object>} Résultat de la création
   */
  async creerCategorie(donneesCategorie) {
    const { idBoutique, nom, slug, description, idCategorieParent, urlImage } = donneesCategorie;

    // Nettoyage et validation des données
    const donneesNettoyees = this.nettoyerDonneesCategorie({
      idBoutique,
      nom,
      slug,
      description,
      idCategorieParent,
      urlImage,
    });

    // Vérification de l'unicité du slug
    await this.verifierSlugUnique(donneesNettoyees.slug, donneesNettoyees.idBoutique);

    // Création de la catégorie
    const nouvelleCategorie = await this.categorieRepository.creer(donneesNettoyees);

    return {
      message: "Catégorie créée avec succès",
      categorie: nouvelleCategorie.toJSON(),
    };
  }

  /**
   * Mettre à jour une catégorie
   * @param {string} categorieId - ID de la catégorie
   * @param {Object} nouvellesDonnees - Nouvelles données
   * @returns {Promise<Object>} Catégorie mise à jour
   */
  async mettreAJourCategorie(categorieId, nouvellesDonnees) {
    // Récupération de la catégorie
    const categorie = await this.categorieRepository.trouverParId(categorieId);
    if (!categorie) {
      throw new Error("Catégorie non trouvée");
    }

    // Nettoyage et validation des données
    const donneesNettoyees = this.nettoyerDonneesCategorie(nouvellesDonnees);

    // Vérification du slug si modifié
    if (donneesNettoyees.slug && donneesNettoyees.slug !== categorie.slug) {
      if (await this.categorieRepository.slugExiste(donneesNettoyees.slug, categorie.idBoutique, categorie._id)) {
        throw new Error("Une catégorie avec ce slug existe déjà dans cette boutique");
      }
    }

    // Application des modifications
    this.appliquerModificationsCategorie(categorie, donneesNettoyees);

    // Sauvegarde
    const categorieMiseAJour = await this.categorieRepository.mettreAJour(categorie);

    return {
      message: "Catégorie mise à jour avec succès",
      categorie: categorieMiseAJour.toJSON(),
    };
  }

  /**
   * Supprimer une catégorie
   * @param {string} categorieId - ID de la catégorie
   * @returns {Promise<Object>} Résultat de la suppression
   */
  async supprimerCategorie(categorieId) {
    const categorie = await this.categorieRepository.trouverParId(categorieId);
    if (!categorie) {
      throw new Error("Catégorie non trouvée");
    }

    // Vérifier qu'il n'y a pas de catégories enfants
    const enfants = await this.categorieRepository.trouverEnfants(categorieId);
    if (enfants.length > 0) {
      throw new Error("Impossible de supprimer une catégorie qui a des sous-catégories");
    }

    await this.categorieRepository.supprimer(categorieId);

    return {
      message: "Catégorie supprimée avec succès",
    };
  }

  /**
   * Obtenir une catégorie par ID
   * @param {string} categorieId - ID de la catégorie
   * @returns {Promise<Object>} Catégorie trouvée
   */
  async obtenirCategorieParId(categorieId) {
    const categorie = await this.categorieRepository.trouverParId(categorieId);
    if (!categorie) {
      throw new Error("Catégorie non trouvée");
    }
    return categorie.toJSON();
  }

  /**
   * Obtenir une catégorie par slug
   * @param {string} slug - Slug de la catégorie
   * @returns {Promise<Object>} Catégorie trouvée
   */
  async obtenirCategorieParSlug(slug) {
    const categorie = await this.categorieRepository.trouverParSlug(slug);
    if (!categorie) {
      throw new Error("Catégorie non trouvée");
    }
    return categorie.toJSON();
  }

  /**
   * Obtenir toutes les catégories d'une boutique
   * @param {string} idBoutique - ID de la boutique
   * @returns {Promise<Array>} Liste des catégories
   */
  async obtenirCategoriesParBoutique(idBoutique) {
    const categories = await this.categorieRepository.trouverParBoutique(idBoutique);
    return categories.map(c => c.toJSON());
  }

  /**
   * Obtenir les catégories enfants d'une catégorie parent
   * @param {string} idCategorieParent - ID de la catégorie parent
   * @returns {Promise<Array>} Liste des catégories enfants
   */
  async obtenirCategoriesEnfants(idCategorieParent) {
    const categories = await this.categorieRepository.trouverEnfants(idCategorieParent);
    return categories.map(c => c.toJSON());
  }

  /**
   * Obtenir l'arbre complet des catégories d'une boutique
   * @param {string} idBoutique - ID de la boutique
   * @returns {Promise<Array>} Arbre des catégories
   */
  async obtenirArbreCategories(idBoutique) {
    const Categorie = require("../../models/boutique/Categorie");
    return await Categorie.buildCategoryTree(idBoutique);
  }

  /**
   * Obtenir les catégories avec leur hiérarchie (niveau et chemin)
   * @param {string} idBoutique - ID de la boutique
   * @returns {Promise<Array>} Catégories avec hiérarchie
   */
  async obtenirCategoriesAvecHierarchie(idBoutique) {
    const Categorie = require("../../models/boutique/Categorie");
    return await Categorie.getCategoriesWithHierarchy(idBoutique);
  }

  /**
   * Obtenir une liste paginée de catégories
   * @param {Object} filtres - Filtres de recherche
   * @param {Object} pagination - Options de pagination
   * @returns {Promise<Object>} Liste paginée des catégories
   */
  async obtenirListeCategories(filtres, pagination) {
    const filtresValides = this.validerFiltresListe(filtres);
    const paginationValide = this.validerPagination(pagination);

    return await this.categorieRepository.obtenirListeAvecPagination(filtresValides, paginationValide);
  }

  // ========== MÉTHODES PRIVÉES DE VALIDATION ==========

  /**
   * Vérifier l'unicité du slug
   * @param {string} slug - Slug à vérifier
   * @param {string} idBoutique - ID de la boutique
   * @private
   */
  async verifierSlugUnique(slug, idBoutique) {
    if (await this.categorieRepository.slugExiste(slug, idBoutique)) {
      throw new Error("Une catégorie avec ce slug existe déjà dans cette boutique");
    }
  }

  /**
   * Nettoyer les données de catégorie
   * @param {Object} donnees - Données brutes
   * @returns {Object} Données nettoyées
   * @private
   */
  nettoyerDonneesCategorie(donnees) {
    const nettoyees = {};

    if (donnees.idBoutique) {
      nettoyees.idBoutique = donnees.idBoutique;
    }
    if (donnees.nom) {
      nettoyees.nom = donnees.nom.trim();
    }
    if (donnees.slug) {
      nettoyees.slug = donnees.slug.toLowerCase().trim();
    }
    if (donnees.description !== undefined) {
      nettoyees.description = donnees.description ? donnees.description.trim() : null;
    }
    if (donnees.idCategorieParent !== undefined) {
      nettoyees.idCategorieParent = donnees.idCategorieParent || null;
    }
    if (donnees.urlImage !== undefined) {
      nettoyees.urlImage = donnees.urlImage ? donnees.urlImage.trim() : null;
    }

    return nettoyees;
  }

  /**
   * Appliquer les modifications à une catégorie
   * @param {Object} categorie - Instance catégorie
   * @param {Object} donnees - Nouvelles données
   * @private
   */
  appliquerModificationsCategorie(categorie, donnees) {
    Object.keys(donnees).forEach((cle) => {
      if (donnees[cle] !== undefined) {
        categorie[cle] = donnees[cle];
      }
    });
  }

  /**
   * Valider les filtres de liste
   * @param {Object} filtres - Filtres à valider
   * @returns {Object} Filtres validés
   * @private
   */
  validerFiltresListe(filtres = {}) {
    const filtresValides = {};

    if (filtres.idBoutique) {
      filtresValides.idBoutique = filtres.idBoutique;
    }
    if (filtres.idCategorieParent !== undefined) {
      filtresValides.idCategorieParent = filtres.idCategorieParent;
    }

    return filtresValides;
  }

  /**
   * Valider la pagination
   * @param {Object} pagination - Pagination à valider
   * @returns {Object} Pagination validée
   * @private
   */
  validerPagination(pagination = {}) {
    return {
      page: Math.max(1, parseInt(pagination.page) || 1),
      limite: Math.min(100, Math.max(1, parseInt(pagination.limite) || 10)),
    };
  }
}

module.exports = CategorieService;
