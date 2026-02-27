const CategorieRepository = require("../../repositories/boutique/CategorieRepository");
const Categorie = require("../../models/boutique/Categorie");

class CategorieService {
  constructor() {
    this.categorieRepository = new CategorieRepository();
  }

  /**
   * Créer une nouvelle catégorie (globale)
   */
  async creerCategorie(donneesCategorie) {
    const { nom, slug, description, idCategorieParent, urlImage } = donneesCategorie;

    const donneesNettoyees = this.nettoyerDonneesCategorie({
      nom,
      slug,
      description,
      idCategorieParent,
      urlImage,
    });

    // Vérification de l'unicité du slug (global)
    await this.verifierSlugUniqueGlobal(donneesNettoyees.slug);

    const nouvelleCategorie = await this.categorieRepository.creer(donneesNettoyees);

    return {
      message: "Catégorie créée avec succès",
      categorie: nouvelleCategorie.toJSON(),
    };
  }

  /**
   * Mettre à jour une catégorie
   */
  async mettreAJourCategorie(categorieId, nouvellesDonnees) {
    const categorie = await this.categorieRepository.trouverParId(categorieId);
    if (!categorie) {
      throw new Error("Catégorie non trouvée");
    }

    const donneesNettoyees = this.nettoyerDonneesCategorie(nouvellesDonnees);

    if (donneesNettoyees.slug && donneesNettoyees.slug !== categorie.slug) {
      if (await this.categorieRepository.slugExisteGlobal(donneesNettoyees.slug, categorie._id)) {
        throw new Error("Une catégorie avec ce slug existe déjà");
      }
    }

    this.appliquerModificationsCategorie(categorie, donneesNettoyees);
    const categorieMiseAJour = await this.categorieRepository.mettreAJour(categorie);

    return {
      message: "Catégorie mise à jour avec succès",
      categorie: categorieMiseAJour.toJSON(),
    };
  }

  /**
   * Supprimer une catégorie
   */
  async supprimerCategorie(categorieId) {
    const categorie = await this.categorieRepository.trouverParId(categorieId);
    if (!categorie) {
      throw new Error("Catégorie non trouvée");
    }

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
   */
  async obtenirCategorieParSlug(slug) {
    const categorie = await this.categorieRepository.trouverParSlug(slug);
    if (!categorie) {
      throw new Error("Catégorie non trouvée");
    }
    return categorie.toJSON();
  }

  /**
   * Obtenir toutes les catégories (référentiel global)
   */
  async obtenirToutesCategories() {
    const categories = await this.categorieRepository.trouverToutes();
    return categories.map(c => c.toJSON());
  }

  /**
   * Obtenir les catégories enfants d'une catégorie parent
   */
  async obtenirCategoriesEnfants(idCategorieParent) {
    const categories = await this.categorieRepository.trouverEnfants(idCategorieParent);
    return categories.map(c => c.toJSON());
  }

  /**
   * Obtenir l'arbre complet des catégories (global)
   */
  async obtenirArbreCategoriesGlobal() {
    return await Categorie.buildCategoryTreeGlobal();
  }

  /**
   * Obtenir les catégories avec leur hiérarchie (global)
   */
  async obtenirCategoriesAvecHierarchieGlobal() {
    return await Categorie.getCategoriesWithHierarchyGlobal();
  }

  /**
   * Obtenir une liste paginée de catégories
   */
  async obtenirListeCategories(filtres = {}, pagination = {}) {
    const filtresValides = this.validerFiltresListe(filtres);
    const paginationValide = this.validerPagination(pagination);

    return await this.categorieRepository.obtenirListeAvecPagination(filtresValides, paginationValide);
  }

  // ========== MÉTHODES PRIVÉES ==========

  async verifierSlugUniqueGlobal(slug) {
    if (await this.categorieRepository.slugExisteGlobal(slug)) {
      throw new Error("Une catégorie avec ce slug existe déjà");
    }
  }

  nettoyerDonneesCategorie(donnees) {
    const nettoyees = {};

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

  appliquerModificationsCategorie(categorie, donnees) {
    Object.keys(donnees).forEach((cle) => {
      if (donnees[cle] !== undefined) {
        categorie[cle] = donnees[cle];
      }
    });
  }

  validerFiltresListe(filtres = {}) {
    const filtresValides = {};
    if (filtres.idCategorieParent !== undefined) {
      filtresValides.idCategorieParent = filtres.idCategorieParent;
    }
    return filtresValides;
  }

  validerPagination(pagination = {}) {
    return {
      page: Math.max(1, parseInt(pagination.page) || 1),
      limite: Math.min(100, Math.max(1, parseInt(pagination.limite) || 10)),
    };
  }
}

module.exports = CategorieService;
