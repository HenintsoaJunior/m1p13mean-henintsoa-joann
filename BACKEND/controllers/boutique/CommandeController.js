const CommandeService = require("../../services/boutique/CommandeService");
const Boutique = require("../../models/admin/Boutique");

class CommandeController {
  constructor() {
    this.service = new CommandeService();
  }

  async _getBoutiqueId(utilisateur) {
    const boutique = await Boutique.findOne({ "contact.email": utilisateur.email });
    if (!boutique) throw new Error("Boutique introuvable pour cet utilisateur");
    return boutique._id;
  }

  async creerCommande(req, res) {
    try {
      const idBoutique = await this._getBoutiqueId(req.utilisateur);
      const commande = await this.service.creerCommande(req.body, idBoutique);
      res.status(201).json({ commande });
    } catch (error) {
      console.error("Erreur création commande:", error);
      res.status(400).json({ erreur: error.message });
    }
  }

  async listerCommandes(req, res) {
    try {
      const idBoutique = await this._getBoutiqueId(req.utilisateur);
      const resultat = await this.service.listerCommandes(idBoutique, {
        statut: req.query.statut,
        page: req.query.page,
        limite: req.query.limite,
      });
      res.json(resultat);
    } catch (error) {
      console.error("Erreur liste commandes:", error);
      res.status(500).json({ erreur: error.message });
    }
  }

  async obtenirCommande(req, res) {
    try {
      const idBoutique = await this._getBoutiqueId(req.utilisateur);
      const commande = await this.service.obtenirCommande(req.params.id, idBoutique);
      res.json({ commande });
    } catch (error) {
      console.error("Erreur obtenir commande:", error);
      const status = error.message.includes("non trouvée") ? 404 : 400;
      res.status(status).json({ erreur: error.message });
    }
  }

  async modifierCommande(req, res) {
    try {
      const idBoutique = await this._getBoutiqueId(req.utilisateur);
      const commande = await this.service.modifierCommande(req.params.id, req.body, idBoutique);
      res.json({ commande });
    } catch (error) {
      console.error("Erreur modifier commande:", error);
      const status = error.message.includes("non trouvée") ? 404 : 400;
      res.status(status).json({ erreur: error.message });
    }
  }

  async modifierStatut(req, res) {
    try {
      const idBoutique = await this._getBoutiqueId(req.utilisateur);
      const { statut } = req.body;
      const commande = await this.service.modifierStatut(req.params.id, statut, idBoutique);
      res.json({ commande });
    } catch (error) {
      console.error("Erreur modifier statut:", error);
      const status = error.message.includes("non trouvée") ? 404 : 400;
      res.status(status).json({ erreur: error.message });
    }
  }

  async supprimerCommande(req, res) {
    try {
      const idBoutique = await this._getBoutiqueId(req.utilisateur);
      await this.service.supprimerCommande(req.params.id, idBoutique);
      res.json({ message: "Commande supprimée avec succès" });
    } catch (error) {
      console.error("Erreur supprimer commande:", error);
      const status = error.message.includes("non trouvée") ? 404 : 400;
      res.status(status).json({ erreur: error.message });
    }
  }

  async stats(req, res) {
    try {
      const idBoutique = await this._getBoutiqueId(req.utilisateur);
      const resultat = await this.service.stats(idBoutique);
      res.json({ stats: resultat });
    } catch (error) {
      console.error("Erreur stats commandes:", error);
      res.status(500).json({ erreur: error.message });
    }
  }
}

module.exports = new CommandeController();
