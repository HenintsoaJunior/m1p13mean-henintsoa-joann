const TypeUniteService = require("../../services/boutique/TypeUniteService");

class TypeUniteController {
  constructor() {
    this.typeUniteService = new TypeUniteService();
  }

  /**
   * Créer un nouveau type d'unité
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async creerTypeUnite(req, res) {
    try {
      const resultat = await this.typeUniteService.creerTypeUnite(req.body);
      res.status(201).json(resultat);
    } catch (error) {
      console.error("Erreur lors de la création du type d'unité:", error);
      res.status(400).json({
        erreur: error.message || "Erreur serveur lors de la création du type d'unité",
      });
    }
  }

  /**
   * Obtenir un type d'unité par ID
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async obtenirTypeUniteParId(req, res) {
    try {
      const typeUnite = await this.typeUniteService.obtenirTypeUniteParId(req.params.id);
      res.json({ typeUnite });
    } catch (error) {
      console.error("Erreur lors de la récupération du type d'unité:", error);
      res.status(404).json({
        erreur: error.message || "Type d'unité non trouvé",
      });
    }
  }

  /**
   * Obtenir tous les types d'unités
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async obtenirTousTypesUnites(req, res) {
    try {
      const { actifsSeulement = "true" } = req.query;
      const typesUnites = await this.typeUniteService.obtenirTousTypesUnites(
        actifsSeulement === "true"
      );
      res.json({ typesUnites });
    } catch (error) {
      console.error("Erreur lors de la récupération des types d'unités:", error);
      res.status(500).json({
        erreur: error.message || "Erreur serveur lors de la récupération des types d'unités",
      });
    }
  }

  /**
   * Mettre à jour un type d'unité
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async mettreAJourTypeUnite(req, res) {
    try {
      const resultat = await this.typeUniteService.mettreAJourTypeUnite(
        req.params.id,
        req.body
      );
      res.json(resultat);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du type d'unité:", error);
      const statusCode = error.message === "Type d'unité non trouvé" ? 404 : 400;
      res.status(statusCode).json({
        erreur: error.message || "Erreur serveur lors de la mise à jour du type d'unité",
      });
    }
  }

  /**
   * Supprimer un type d'unité
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async supprimerTypeUnite(req, res) {
    try {
      const resultat = await this.typeUniteService.supprimerTypeUnite(req.params.id);
      res.json(resultat);
    } catch (error) {
      console.error("Erreur lors de la suppression du type d'unité:", error);
      const statusCode = error.message === "Type d'unité non trouvé" ? 404 : 400;
      res.status(statusCode).json({
        erreur: error.message || "Erreur serveur lors de la suppression du type d'unité",
      });
    }
  }

  /**
   * Ajouter une valeur à un type d'unité
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async ajouterValeur(req, res) {
    try {
      const { valeur } = req.body;
      const resultat = await this.typeUniteService.ajouterValeur(req.params.id, valeur);
      res.json(resultat);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la valeur:", error);
      res.status(400).json({
        erreur: error.message || "Erreur serveur lors de l'ajout de la valeur",
      });
    }
  }

  /**
   * Supprimer une valeur d'un type d'unité
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async supprimerValeur(req, res) {
    try {
      const { valeur } = req.params;
      const resultat = await this.typeUniteService.supprimerValeur(req.params.id, valeur);
      res.json(resultat);
    } catch (error) {
      console.error("Erreur lors de la suppression de la valeur:", error);
      res.status(400).json({
        erreur: error.message || "Erreur serveur lors de la suppression de la valeur",
      });
    }
  }
}

module.exports = new TypeUniteController();
