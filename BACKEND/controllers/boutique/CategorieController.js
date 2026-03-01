const CategorieService = require("../../services/boutique/CategorieService");

class CategorieController {
  constructor() {
    this.categorieService = new CategorieService();
  }

  /**
   * Créer une nouvelle catégorie (globale - sans boutique)
   */
  async creerCategorie(req, res) {
    try {
      // Les catégories sont globales, pas de idBoutique
      const resultat = await this.categorieService.creerCategorie(req.body);
      res.status(201).json(resultat);
    } catch (error) {
      console.error("Erreur lors de la création de la catégorie:", error);
      res.status(400).json({
        erreur: error.message || "Erreur serveur lors de la création de la catégorie",
      });
    }
  }

  /**
   * Mettre à jour une catégorie
   */
  async mettreAJourCategorie(req, res) {
    try {
      const resultat = await this.categorieService.mettreAJourCategorie(
        req.params.id,
        req.body
      );
      res.json(resultat);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la catégorie:", error);
      const statusCode = error.message === "Catégorie non trouvée" ? 404 : 400;
      res.status(statusCode).json({
        erreur: error.message || "Erreur serveur lors de la mise à jour de la catégorie",
      });
    }
  }

  /**
   * Supprimer une catégorie
   */
  async supprimerCategorie(req, res) {
    try {
      const resultat = await this.categorieService.supprimerCategorie(req.params.id);
      res.json(resultat);
    } catch (error) {
      console.error("Erreur lors de la suppression de la catégorie:", error);
      const statusCode = error.message === "Catégorie non trouvée" ? 404 : 400;
      res.status(statusCode).json({
        erreur: error.message || "Erreur serveur lors de la suppression de la catégorie",
      });
    }
  }

  /**
   * Obtenir une catégorie par ID
   */
  async obtenirCategorieParId(req, res) {
    try {
      const categorie = await this.categorieService.obtenirCategorieParId(req.params.id);
      res.json({ categorie });
    } catch (error) {
      console.error("Erreur lors de la récupération de la catégorie:", error);
      res.status(404).json({
        erreur: error.message || "Catégorie non trouvée",
      });
    }
  }

  /**
   * Obtenir une catégorie par slug
   */
  async obtenirCategorieParSlug(req, res) {
    try {
      const categorie = await this.categorieService.obtenirCategorieParSlug(req.params.slug);
      res.json({ categorie });
    } catch (error) {
      console.error("Erreur lors de la récupération de la catégorie:", error);
      res.status(404).json({
        erreur: error.message || "Catégorie non trouvée",
      });
    }
  }

  /**
   * Obtenir toutes les catégories (référentiel global - toutes les boutiques)
   */
  async obtenirCategoriesParBoutique(req, res) {
    try {
      const categories = await this.categorieService.obtenirToutesCategories();
      res.json({ categories });
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error);
      res.status(500).json({
        erreur: error.message || "Erreur serveur lors de la récupération des catégories",
      });
    }
  }

  /**
   * Obtenir les catégories enfants d'une catégorie parent
   */
  async obtenirCategoriesEnfants(req, res) {
    try {
      const categories = await this.categorieService.obtenirCategoriesEnfants(req.params.idParent);
      res.json({ categories });
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories enfants:", error);
      res.status(500).json({
        erreur: error.message || "Erreur serveur lors de la récupération des catégories enfants",
      });
    }
  }

  /**
   * Obtenir l'arbre complet des catégories (global)
   */
  async obtenirArbreCategories(req, res) {
    try {
      const arbre = await this.categorieService.obtenirArbreCategoriesGlobal();
      res.json({ arbre });
    } catch (error) {
      console.error("Erreur lors de la récupération de l'arbre des catégories:", error);
      res.status(500).json({
        erreur: error.message || "Erreur serveur lors de la récupération de l'arbre des catégories",
      });
    }
  }

  /**
   * Obtenir les catégories avec leur hiérarchie (global)
   */
  async obtenirCategoriesAvecHierarchie(req, res) {
    try {
      const categories = await this.categorieService.obtenirCategoriesAvecHierarchieGlobal();
      res.json({ categories });
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories avec hiérarchie:", error);
      res.status(500).json({
        erreur: error.message || "Erreur serveur lors de la récupération des catégories avec hiérarchie",
      });
    }
  }

  /**
   * Obtenir une liste paginée de catégories
   */
  async obtenirListeCategories(req, res) {
    try {
      const filtres = {
        idCategorieParent: req.query.idCategorieParent,
      };

      const pagination = {
        page: req.query.page || 1,
        limite: req.query.limite || 10,
      };

      const resultat = await this.categorieService.obtenirListeCategories(filtres, pagination);
      res.json(resultat);
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error);
      res.status(500).json({
        erreur: "Erreur serveur lors de la récupération des catégories",
      });
    }
  }
}

module.exports = new CategorieController();
