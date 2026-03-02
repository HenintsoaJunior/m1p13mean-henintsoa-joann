const PromotionRepository = require("../../repositories/boutique/PromotionRepository");
const Promotion = require("../../models/boutique/Promotion");

class PromotionService {
  constructor() {
    this.promoRepo = new PromotionRepository();
  }

  async creerPromotion(donnees) {
    // validation minimale
    if (!donnees.idBoutique) {
      throw new Error("ID de boutique requis pour la promotion");
    }
    if (!donnees.type || !["pourcentage", "montant"].includes(donnees.type)) {
      throw new Error("Type de promotion invalide");
    }
    if (donnees.valeur == null || isNaN(donnees.valeur) || donnees.valeur < 0) {
      throw new Error("Valeur de promotion invalide");
    }
    if (!donnees.dateDebut || !donnees.dateFin) {
      throw new Error("Période de promotion requise");
    }
    if (new Date(donnees.dateFin) < new Date(donnees.dateDebut)) {
      throw new Error("La date de fin doit être postérieure à la date de début");
    }
    // variant validation: if idVariante provided, require idProduit as well
    if (donnees.idVariante && !donnees.idProduit) {
      throw new Error("Une variante nécessite un produit associé");
    }

    return await this.promoRepo.creer(donnees);
  }

  async obtenirPromotionParId(id) {
    const promo = await this.promoRepo.trouverParId(id);
    if (!promo) throw new Error("Promotion non trouvée");
    return promo;
  }

  async obtenirPromotionsBoutique(idBoutique, options = {}) {
    return await this.promoRepo.trouverParBoutique(idBoutique, options);
  }

  async mettreAJourPromotion(id, donnees) {
    const promo = await this.promoRepo.mettreAJour(id, donnees);
    if (!promo) throw new Error("Promotion non trouvée");
    return promo;
  }

  async supprimerPromotion(id) {
    const promo = await this.promoRepo.supprimer(id);
    if (!promo) throw new Error("Promotion non trouvée");
    return promo;
  }

  /**
   * Pour une liste de produits, attache la promotion active (la première trouvée)
   * Priorité: promotion produit > categorie > boutique
   */
  async annoterProduits(produits) {
    if (!Array.isArray(produits) || produits.length === 0) return produits;
    const now = new Date();
    
    // Récupérer toutes les promotions actives
    const promos = await Promotion.find({
      statut: "active",
      dateDebut: { $lte: now },
      dateFin: { $gte: now },
    });

    // associer à chaque produit la promotion applicable (avec priorité)
    return produits.map(p => {
      const produitId = p._id.toString();
      const categorieId = p.idCategorie ? (typeof p.idCategorie === 'object' ? p.idCategorie._id : p.idCategorie).toString() : null;
      const boutiqueId = p.idBoutique ? (typeof p.idBoutique === 'object' ? p.idBoutique._id : p.idBoutique).toString() : null;

      // Priorité 1: promotion au niveau du produit
      let promo = promos.find(pr => pr.idProduit && pr.idProduit.toString() === produitId);
      
      // Priorité 2: promotion au niveau de la catégorie
      if (!promo && categorieId) {
        promo = promos.find(pr => pr.idCategorie && pr.idCategorie.toString() === categorieId && !pr.idProduit);
      }
      
      // Priorité 3: promotion au niveau de la boutique
      if (!promo && boutiqueId) {
        promo = promos.find(pr => pr.idBoutique && pr.idBoutique.toString() === boutiqueId && !pr.idCategorie && !pr.idProduit);
      }

      return {
        ...p.toJSON(),
        promotion: promo ? promo.toObject() : null,
      };
    });
  }
}

module.exports = PromotionService;