const MouvementStockService = require("../../services/boutique/MouvementStockService");

class MouvementStockController {
  constructor() {
    this.service = new MouvementStockService();
  }

  async creerMouvement(req, res) {
    try {
      const resultat = await this.service.creerMouvement({
        ...req.body,
        idBoutique: req.utilisateur._id,
        utilisateur: req.utilisateur._id,
      });
      res.status(201).json(resultat);
    } catch (error) {
      console.error("Erreur mouvement stock:", error);
      res.status(400).json({ erreur: error.message });
    }
  }

  async listerMouvements(req, res) {
    try {
      const resultat = await this.service.listerMouvements(
        req.utilisateur._id,
        {
          page: req.query.page,
          limite: req.query.limite,
          idProduit: req.query.idProduit,
          type: req.query.type,
        }
      );
      res.json(resultat);
    } catch (error) {
      console.error("Erreur liste mouvements:", error);
      res.status(500).json({ erreur: error.message });
    }
  }

  async listerParProduit(req, res) {
    try {
      const resultat = await this.service.listerParProduit(
        req.params.idProduit,
        req.utilisateur._id
      );
      res.json(resultat);
    } catch (error) {
      console.error("Erreur mouvements produit:", error);
      const status = error.message.includes("non trouvé") ? 404 : 400;
      res.status(status).json({ erreur: error.message });
    }
  }

  async stats(req, res) {
    try {
      const resultat = await this.service.stats(req.utilisateur._id);
      res.json({ stats: resultat });
    } catch (error) {
      console.error("Erreur stats mouvements:", error);
      res.status(500).json({ erreur: error.message });
    }
  }
}

module.exports = new MouvementStockController();
