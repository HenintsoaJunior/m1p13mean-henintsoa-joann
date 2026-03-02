const PromotionService = require("../../services/boutique/PromotionService");
const Boutique = require("../../models/admin/Boutique");

class PromotionController {
  constructor() {
    this.promoService = new PromotionService();
  }

  async _getBoutiqueId(utilisateur) {
    const boutique = await Boutique.findOne({ "contact.email": utilisateur.email });
    if (!boutique) throw new Error("Boutique introuvable pour cet utilisateur");
    return boutique._id;
  }

  // --- admin actions (boutique) ---

  async creerPromotion(req, res) {
    try {
      const idBoutique = await this._getBoutiqueId(req.utilisateur);
      const donnees = { ...req.body, idBoutique };
      const promo = await this.promoService.creerPromotion(donnees);
      res.status(201).json({ promotion: promo });
    } catch (err) {
      console.error("Erreur création promotion", err);
      res.status(400).json({ erreur: err.message || "Erreur serveur" });
    }
  }

  async listerPromotions(req, res) {
    try {
      const idBoutique = await this._getBoutiqueId(req.utilisateur);
      const options = {};
      if (req.query.active === 'true') options.activeOnly = true;
      if (req.query.statut) options.statut = req.query.statut;
      const promos = await this.promoService.obtenirPromotionsBoutique(idBoutique, options);
      res.json({ promotions: promos });
    } catch (err) {
      console.error("Erreur liste promotions", err);
      res.status(500).json({ erreur: err.message || "Erreur serveur" });
    }
  }

  async obtenirPromotion(req, res) {
    try {
      const promo = await this.promoService.obtenirPromotionParId(req.params.id);
      res.json({ promotion: promo });
    } catch (err) {
      console.error("Erreur récupération promotion", err);
      res.status(404).json({ erreur: err.message || "Promotion non trouvée" });
    }
  }

  async mettreAJourPromotion(req, res) {
    try {
      const promo = await this.promoService.mettreAJourPromotion(req.params.id, req.body);
      res.json({ promotion: promo });
    } catch (err) {
      console.error("Erreur mise à jour promotion", err);
      const status = err.message === "Promotion non trouvée" ? 404 : 400;
      res.status(status).json({ erreur: err.message || "Erreur serveur" });
    }
  }

  async supprimerPromotion(req, res) {
    try {
      await this.promoService.supprimerPromotion(req.params.id);
      res.json({ message: "Promotion supprimée" });
    } catch (err) {
      console.error("Erreur suppression promotion", err);
      res.status(404).json({ erreur: err.message || "Promotion non trouvée" });
    }
  }

  // --- public / client actions ---
  async promotionsActives(req, res) {
    try {
      // on pourrait filtrer par boutique ou catégorie
      const { idBoutique } = req.query;
      if (!idBoutique) {
        return res.status(400).json({ erreur: "idBoutique requis" });
      }
      const promos = await this.promoService.obtenirPromotionsBoutique(idBoutique, { activeOnly: true });
      res.json({ promotions: promos });
    } catch (err) {
      console.error("Erreur promotions actives", err);
      res.status(500).json({ erreur: err.message || "Erreur serveur" });
    }
  }
}

module.exports = new PromotionController();
