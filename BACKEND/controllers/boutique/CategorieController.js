const CategorieService = require("../../services/boutique/CategorieService");

class CategorieController {
  constructor() {
    this.categorieService = new CategorieService();
  }

  /**
   * Créer une nouvelle catégorie
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async creerCategorie(req, res) {
    try {
      // Ajouter l'ID de la boutique depuis l'utilisateur authentifié
      const donneesAvecBoutique = {
        ...req.body,
        idBoutique: req.utilisateur._id,
      };

      const resultat = await this.categorieService.creerCategorie(donneesAvecBoutique);
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
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
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
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
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
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
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
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
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
   * Obtenir toutes les catégories d'une boutique
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async obtenirCategoriesParBoutique(req, res) {
    try {
      const idBoutique = req.utilisateur._id;
      const categories = await this.categorieService.obtenirCategoriesParBoutique(idBoutique);
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
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
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
   * Obtenir l'arbre complet des catégories d'une boutique
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async obtenirArbreCategories(req, res) {
    try {
      const idBoutique = req.utilisateur._id;
      const arbre = await this.categorieService.obtenirArbreCategories(idBoutique);
      res.json({ arbre });
    } catch (error) {
      console.error("Erreur lors de la récupération de l'arbre des catégories:", error);
      res.status(500).json({
        erreur: error.message || "Erreur serveur lors de la récupération de l'arbre des catégories",
      });
    }
  }

  /**
   * Obtenir les catégories avec leur hiérarchie (niveau et chemin)
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async obtenirCategoriesAvecHierarchie(req, res) {
    try {
      const idBoutique = req.utilisateur._id;
      const categories = await this.categorieService.obtenirCategoriesAvecHierarchie(idBoutique);
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
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async obtenirListeCategories(req, res) {
    try {
      const filtres = {
        idBoutique: req.utilisateur._id,
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
