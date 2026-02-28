const CouleurService = require("../../services/boutique/CouleurService");

class CouleurController {
  constructor() {
    this.couleurService = new CouleurService();
  }

  /**
   * Créer une nouvelle couleur
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async creerCouleur(req, res) {
    try {
      const resultat = await this.couleurService.creerCouleur(req.body);
      res.status(201).json(resultat);
    } catch (error) {
      console.error("Erreur lors de la création de la couleur:", error);
      res.status(400).json({
        erreur: error.message || "Erreur serveur lors de la création de la couleur",
      });
    }
  }

  /**
   * Obtenir une couleur par ID
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async obtenirCouleurParId(req, res) {
    try {
      const couleur = await this.couleurService.obtenirCouleurParId(req.params.id);
      res.json({ couleur });
    } catch (error) {
      console.error("Erreur lors de la récupération de la couleur:", error);
      res.status(404).json({
        erreur: error.message || "Couleur non trouvée",
      });
    }
  }

  /**
   * Obtenir toutes les couleurs
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async obtenirToutesCouleurs(req, res) {
    try {
      const { activesSeulement = "true", categorie } = req.query;
      let couleurs;

      if (categorie) {
        couleurs = await this.couleurService.obtenirCouleursParCategorie(categorie);
      } else {
        couleurs = await this.couleurService.obtenirToutesCouleurs(
          activesSeulement === "true"
        );
      }

      res.json({ couleurs });
    } catch (error) {
      console.error("Erreur lors de la récupération des couleurs:", error);
      res.status(500).json({
        erreur: error.message || "Erreur serveur lors de la récupération des couleurs",
      });
    }
  }

  /**
   * Mettre à jour une couleur
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async mettreAJourCouleur(req, res) {
    try {
      const resultat = await this.couleurService.mettreAJourCouleur(
        req.params.id,
        req.body
      );
      res.json(resultat);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la couleur:", error);
      const statusCode = error.message === "Couleur non trouvée" ? 404 : 400;
      res.status(statusCode).json({
        erreur: error.message || "Erreur serveur lors de la mise à jour de la couleur",
      });
    }
  }

  /**
   * Supprimer une couleur
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async supprimerCouleur(req, res) {
    try {
      const resultat = await this.couleurService.supprimerCouleur(req.params.id);
      res.json(resultat);
    } catch (error) {
      console.error("Erreur lors de la suppression de la couleur:", error);
      const statusCode = error.message === "Couleur non trouvée" ? 404 : 400;
      res.status(statusCode).json({
        erreur: error.message || "Erreur serveur lors de la suppression de la couleur",
      });
    }
  }

  /**
   * Rechercher des couleurs
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async rechercherCouleurs(req, res) {
    try {
      const { terme } = req.query;

      if (!terme) {
        return res.status(400).json({
          erreur: "Le terme de recherche est requis",
        });
      }

      const couleurs = await this.couleurService.rechercherCouleurs(terme);
      res.json({ couleurs });
    } catch (error) {
      console.error("Erreur lors de la recherche des couleurs:", error);
      res.status(500).json({
        erreur: error.message || "Erreur serveur lors de la recherche des couleurs",
      });
    }
  }
}

module.exports = new CouleurController();
