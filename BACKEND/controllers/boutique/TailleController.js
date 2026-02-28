const TailleService = require("../../services/boutique/TailleService");

class TailleController {
  constructor() {
    this.tailleService = new TailleService();
  }

  /**
   * Créer une nouvelle taille
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async creerTaille(req, res) {
    try {
      const resultat = await this.tailleService.creerTaille(req.body);
      res.status(201).json(resultat);
    } catch (error) {
      console.error("Erreur lors de la création de la taille:", error);
      res.status(400).json({
        erreur: error.message || "Erreur serveur lors de la création de la taille",
      });
    }
  }

  /**
   * Obtenir une taille par ID
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async obtenirTailleParId(req, res) {
    try {
      const taille = await this.tailleService.obtenirTailleParId(req.params.id);
      res.json({ taille });
    } catch (error) {
      console.error("Erreur lors de la récupération de la taille:", error);
      res.status(404).json({
        erreur: error.message || "Taille non trouvée",
      });
    }
  }

  /**
   * Obtenir toutes les tailles
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async obtenirToutesTailles(req, res) {
    try {
      const { activesSeulement = "true" } = req.query;
      const tailles = await this.tailleService.obtenirToutesTailles(
        activesSeulement === "true"
      );
      res.json({ tailles });
    } catch (error) {
      console.error("Erreur lors de la récupération des tailles:", error);
      res.status(500).json({
        erreur: error.message || "Erreur serveur lors de la récupération des tailles",
      });
    }
  }

  /**
   * Obtenir les tailles par type d'unité
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async obtenirTaillesParTypeUnite(req, res) {
    try {
      const { idTypeUnite } = req.params;
      const tailles = await this.tailleService.obtenirTaillesParTypeUnite(idTypeUnite);
      res.json({ tailles });
    } catch (error) {
      console.error("Erreur lors de la récupération des tailles:", error);
      res.status(400).json({
        erreur: error.message || "Erreur serveur lors de la récupération des tailles",
      });
    }
  }

  /**
   * Obtenir les tailles standards
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async obtenirTaillesStandards(req, res) {
    try {
      const tailles = await this.tailleService.obtenirTaillesStandards();
      res.json({ tailles });
    } catch (error) {
      console.error("Erreur lors de la récupération des tailles standards:", error);
      res.status(500).json({
        erreur: error.message || "Erreur serveur lors de la récupération des tailles standards",
      });
    }
  }

  /**
   * Mettre à jour une taille
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async mettreAJourTaille(req, res) {
    try {
      const resultat = await this.tailleService.mettreAJourTaille(
        req.params.id,
        req.body
      );
      res.json(resultat);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la taille:", error);
      const statusCode = error.message === "Taille non trouvée" ? 404 : 400;
      res.status(statusCode).json({
        erreur: error.message || "Erreur serveur lors de la mise à jour de la taille",
      });
    }
  }

  /**
   * Supprimer une taille
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async supprimerTaille(req, res) {
    try {
      const resultat = await this.tailleService.supprimerTaille(req.params.id);
      res.json(resultat);
    } catch (error) {
      console.error("Erreur lors de la suppression de la taille:", error);
      const statusCode = error.message === "Taille non trouvée" ? 404 : 400;
      res.status(statusCode).json({
        erreur: error.message || "Erreur serveur lors de la suppression de la taille",
      });
    }
  }

  /**
   * Rechercher des tailles
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async rechercherTailles(req, res) {
    try {
      const { terme, idTypeUnite } = req.query;

      if (!terme) {
        return res.status(400).json({
          erreur: "Le terme de recherche est requis",
        });
      }

      const tailles = await this.tailleService.rechercherTailles(terme, idTypeUnite || null);
      res.json({ tailles });
    } catch (error) {
      console.error("Erreur lors de la recherche des tailles:", error);
      res.status(500).json({
        erreur: error.message || "Erreur serveur lors de la recherche des tailles",
      });
    }
  }
}

module.exports = new TailleController();
