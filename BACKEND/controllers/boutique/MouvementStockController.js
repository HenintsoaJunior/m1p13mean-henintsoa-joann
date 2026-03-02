const MouvementStockService = require("../../services/boutique/MouvementStockService");
const Boutique = require("../../models/admin/Boutique");

class MouvementStockController {
  constructor() {
    this.service = new MouvementStockService();
  }

  async _getBoutiqueId(utilisateur) {
    const boutique = await Boutique.findOne({ "contact.email": utilisateur.email });
    if (!boutique) throw new Error("Boutique introuvable pour cet utilisateur");
    return boutique._id;
  }

  async creerMouvement(req, res) {
    try {
      const idBoutique = await this._getBoutiqueId(req.utilisateur);
      const resultat = await this.service.creerMouvement({
        ...req.body,
        idBoutique,
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
      const idBoutique = await this._getBoutiqueId(req.utilisateur);
      const resultat = await this.service.listerMouvements(idBoutique, {
        page: req.query.page,
        limite: req.query.limite,
        idProduit: req.query.idProduit,
        type: req.query.type,
      });
      res.json(resultat);
    } catch (error) {
      console.error("Erreur liste mouvements:", error);
      res.status(500).json({ erreur: error.message });
    }
  }

  async listerParProduit(req, res) {
    try {
      const idBoutique = await this._getBoutiqueId(req.utilisateur);
      const resultat = await this.service.listerParProduit(req.params.idProduit, idBoutique);
      res.json(resultat);
    } catch (error) {
      console.error("Erreur mouvements produit:", error);
      const status = error.message.includes("non trouvé") ? 404 : 400;
      res.status(status).json({ erreur: error.message });
    }
  }

  async stats(req, res) {
    try {
      const idBoutique = await this._getBoutiqueId(req.utilisateur);
      const resultat = await this.service.stats(idBoutique);
      res.json({ stats: resultat });
    } catch (error) {
      console.error("Erreur stats mouvements:", error);
      res.status(500).json({ erreur: error.message });
    }
  }
}

module.exports = new MouvementStockController();
