const MarqueService = require("../../services/boutique/MarqueService");

class MarqueController {
  constructor() {
    this.marqueService = new MarqueService();
  }

  /**
   * Créer une nouvelle marque
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async creerMarque(req, res) {
    try {
      const resultat = await this.marqueService.creerMarque(req.body);
      res.status(201).json(resultat);
    } catch (error) {
      console.error("Erreur lors de la création de la marque:", error);
      res.status(400).json({
        erreur: error.message || "Erreur serveur lors de la création de la marque",
      });
    }
  }

  /**
   * Obtenir une marque par ID
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async obtenirMarqueParId(req, res) {
    try {
      const marque = await this.marqueService.obtenirMarqueParId(req.params.id);
      res.json({ marque });
    } catch (error) {
      console.error("Erreur lors de la récupération de la marque:", error);
      res.status(404).json({
        erreur: error.message || "Marque non trouvée",
      });
    }
  }

  /**
   * Obtenir une marque par slug
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async obtenirMarqueParSlug(req, res) {
    try {
      const marque = await this.marqueService.obtenirMarqueParSlug(req.params.slug);
      res.json({ marque });
    } catch (error) {
      console.error("Erreur lors de la récupération de la marque:", error);
      res.status(404).json({
        erreur: error.message || "Marque non trouvée",
      });
    }
  }

  /**
   * Obtenir toutes les marques
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async obtenirToutesMarques(req, res) {
    try {
      const { activesSeulement = "true" } = req.query;
      const marques = await this.marqueService.obtenirToutesMarques(
        activesSeulement === "true"
      );
      res.json({ marques });
    } catch (error) {
      console.error("Erreur lors de la récupération des marques:", error);
      res.status(500).json({
        erreur: error.message || "Erreur serveur lors de la récupération des marques",
      });
    }
  }

  /**
   * Mettre à jour une marque
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async mettreAJourMarque(req, res) {
    try {
      const resultat = await this.marqueService.mettreAJourMarque(
        req.params.id,
        req.body
      );
      res.json(resultat);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la marque:", error);
      const statusCode = error.message === "Marque non trouvée" ? 404 : 400;
      res.status(statusCode).json({
        erreur: error.message || "Erreur serveur lors de la mise à jour de la marque",
      });
    }
  }

  /**
   * Supprimer une marque
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async supprimerMarque(req, res) {
    try {
      const resultat = await this.marqueService.supprimerMarque(req.params.id);
      res.json(resultat);
    } catch (error) {
      console.error("Erreur lors de la suppression de la marque:", error);
      const statusCode = error.message === "Marque non trouvée" ? 404 : 400;
      res.status(statusCode).json({
        erreur: error.message || "Erreur serveur lors de la suppression de la marque",
      });
    }
  }

  /**
   * Rechercher des marques
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async rechercherMarques(req, res) {
    try {
      const { terme } = req.query;

      if (!terme) {
        return res.status(400).json({
          erreur: "Le terme de recherche est requis",
        });
      }

      const marques = await this.marqueService.rechercherMarques(terme);
      res.json({ marques });
    } catch (error) {
      console.error("Erreur lors de la recherche des marques:", error);
      res.status(500).json({
        erreur: error.message || "Erreur serveur lors de la recherche des marques",
      });
    }
  }
}

module.exports = new MarqueController();
