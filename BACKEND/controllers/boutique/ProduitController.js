const ProduitService = require("../../services/boutique/ProduitService");
const Boutique = require("../../models/admin/Boutique");

class ProduitController {
  constructor() {
    this.produitService = new ProduitService();
  }

  async _getBoutiqueId(utilisateur) {
    const boutique = await Boutique.findOne({ "contact.email": utilisateur.email });
    if (!boutique) throw new Error("Boutique introuvable pour cet utilisateur");
    return boutique._id;
  }

  async creerProduit(req, res) {
    try {
      const boutique = await Boutique.findOne({ "contact.email": req.utilisateur.email });
      if (!boutique) return res.status(404).json({ erreur: "Boutique introuvable pour cet utilisateur" });

      const donneesAvecBoutique = {
        ...req.body,
        idBoutique: boutique._id,
      };

      const resultat = await this.produitService.creerProduit(donneesAvecBoutique);
      res.status(201).json(resultat);
    } catch (error) {
      console.error("Erreur lors de la création du produit:", error);
      res.status(400).json({
        erreur: error.message || "Erreur serveur lors de la création du produit",
      });
    }
  }

  /**
   * Mettre à jour un produit
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async mettreAJourProduit(req, res) {
    try {
      const resultat = await this.produitService.mettreAJourProduit(
        req.params.id,
        req.body
      );
      res.json(resultat);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du produit:", error);
      const statusCode = error.message === "Produit non trouvé" ? 404 : 400;
      res.status(statusCode).json({
        erreur: error.message || "Erreur serveur lors de la mise à jour du produit",
      });
    }
  }

  /**
   * Supprimer un produit
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async supprimerProduit(req, res) {
    try {
      const resultat = await this.produitService.supprimerProduit(req.params.id);
      res.json(resultat);
    } catch (error) {
      console.error("Erreur lors de la suppression du produit:", error);
      const statusCode = error.message === "Produit non trouvé" ? 404 : 400;
      res.status(statusCode).json({
        erreur: error.message || "Erreur serveur lors de la suppression du produit",
      });
    }
  }

  /**
   * Obtenir un produit par ID
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async obtenirProduitParId(req, res) {
    try {
      const produit = await this.produitService.obtenirProduitParId(req.params.id);
      res.json({ produit });
    } catch (error) {
      console.error("Erreur lors de la récupération du produit:", error);
      res.status(404).json({
        erreur: error.message || "Produit non trouvé",
      });
    }
  }

  /**
   * Obtenir un produit par slug
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async obtenirProduitParSlug(req, res) {
    try {
      const produit = await this.produitService.obtenirProduitParSlug(req.params.slug);
      res.json({ produit });
    } catch (error) {
      console.error("Erreur lors de la récupération du produit:", error);
      res.status(404).json({
        erreur: error.message || "Produit non trouvé",
      });
    }
  }

  /**
   * Obtenir tous les produits d'une boutique
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async obtenirProduitsParBoutique(req, res) {
    try {
      const idBoutique = await this._getBoutiqueId(req.utilisateur);
      const produits = await this.produitService.obtenirProduitsParBoutique(idBoutique);
      res.json({ produits });
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
      res.status(500).json({ erreur: error.message || "Erreur serveur lors de la récupération des produits" });
    }
  }

  /**
   * Obtenir les produits par catégorie
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async obtenirProduitsParCategorie(req, res) {
    try {
      const produits = await this.produitService.obtenirProduitsParCategorie(req.params.idCategorie);
      res.json({ produits });
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
      res.status(500).json({
        erreur: error.message || "Erreur serveur lors de la récupération des produits",
      });
    }
  }

  /**
   * Obtenir les produits par statut
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async obtenirProduitsParStatut(req, res) {
    try {
      const produits = await this.produitService.obtenirProduitsParStatut(req.params.statut);
      res.json({ produits });
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
      res.status(500).json({
        erreur: error.message || "Erreur serveur lors de la récupération des produits",
      });
    }
  }

  /**
   * Mettre à jour le stock d'un produit
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async mettreAJourStock(req, res) {
    try {
      const { quantite } = req.body;
      const resultat = await this.produitService.mettreAJourStock(req.params.id, quantite);
      res.json(resultat);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du stock:", error);
      const statusCode = error.message === "Produit non trouvé" ? 404 : 400;
      res.status(statusCode).json({
        erreur: error.message || "Erreur serveur lors de la mise à jour du stock",
      });
    }
  }

  /**
   * Rechercher des produits
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async rechercherProduits(req, res) {
    try {
      const { terme } = req.query;
      if (!terme) return res.status(400).json({ erreur: "Le terme de recherche est requis" });
      const idBoutique = await this._getBoutiqueId(req.utilisateur);
      const produits = await this.produitService.rechercherProduits(terme, idBoutique);
      res.json({ produits });
    } catch (error) {
      console.error("Erreur lors de la recherche des produits:", error);
      res.status(500).json({ erreur: error.message || "Erreur serveur lors de la recherche des produits" });
    }
  }

  /**
   * Obtenir une liste paginée de produits
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async obtenirListeProduits(req, res) {
    try {
      const idBoutique = await this._getBoutiqueId(req.utilisateur);
      const filtres = {
        idBoutique,
        idCategorie: req.query.idCategorie,
        statut: req.query.statut,
      };
      const pagination = { page: req.query.page || 1, limite: req.query.limite || 10 };
      const resultat = await this.produitService.obtenirListeProduits(filtres, pagination);
      res.json(resultat);
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
      res.status(500).json({ erreur: "Erreur serveur lors de la récupération des produits" });
    }
  }
}

module.exports = new ProduitController();
