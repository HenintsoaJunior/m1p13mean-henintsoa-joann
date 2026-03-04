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
    await this.expirerPromotionsObsoletes();
    const promo = await this.promoRepo.trouverParId(id);
    if (!promo) throw new Error("Promotion non trouvée");
    return promo;
  }

  /**
   * Archive toutes les promotions dont la dateFin est dépassée
   */
  async expirerPromotionsObsoletes() {
    const now = new Date();
    await Promotion.updateMany(
      { statut: "active", dateFin: { $lt: now } },
      { $set: { statut: "archive" } }
    );
  }

  async obtenirPromotionsBoutique(idBoutique, options = {}) {
    await this.expirerPromotionsObsoletes();
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

    // Archiver les promotions expirées avant d'annoter
    await this.expirerPromotionsObsoletes();
    // Début du jour courant (minuit) pour inclure les promos dont dateDebut = aujourd'hui
    const startOfDay = new Date(now);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    // Récupérer toutes les promotions actives
    const promos = await Promotion.find({
      statut: "active",
      dateDebut: { $lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000) },
      dateFin: { $gte: startOfDay },
    });

    console.log(`[PROMO SERVICE] Date now: ${now.toISOString()}`);
    console.log(`[PROMO SERVICE] Promotions actives trouvées: ${promos.length}`);
    promos.forEach(pr => {
      console.log(`  → id:${pr._id} type:${pr.type} valeur:${pr.valeur} idProduit:${pr.idProduit} idCategorie:${pr.idCategorie} idBoutique:${pr.idBoutique} debut:${pr.dateDebut} fin:${pr.dateFin}`);
    });

    // Debug: toutes les promos DB sans filtre date/statut
    const toutesPromos = await Promotion.find({}).lean();
    console.log(`[PROMO SERVICE DEBUG ALL] Total dans DB (sans filtre): ${toutesPromos.length}`);
    toutesPromos.forEach(pr => {
      console.log(`  [ALL] id:${pr._id} statut:${pr.statut} type:${pr.type} valeur:${pr.valeur} idProduit:${pr.idProduit} idVariante:${pr.idVariante} debut:${pr.dateDebut?.toISOString?.()} fin:${pr.dateFin?.toISOString?.()}`);
    });

    // associer à chaque produit la promotion applicable (avec priorité)
    return produits.map(p => {
      const produitId = p._id.toString();
      // idCategorie est maintenant un tableau
      const categorieIds = Array.isArray(p.idCategorie)
        ? p.idCategorie.map(c => (c && typeof c === 'object' ? c._id : c)?.toString()).filter(Boolean)
        : p.idCategorie
          ? [(typeof p.idCategorie === 'object' ? p.idCategorie._id : p.idCategorie)?.toString()].filter(Boolean)
          : [];
      const boutiqueId = p.idBoutique ? (typeof p.idBoutique === 'object' ? p.idBoutique._id : p.idBoutique).toString() : null;

      console.log(`[PROMO MATCH] Produit: ${produitId} | boutique: ${boutiqueId} | categories: ${categorieIds.join(',')}`);

      // Priorité 1: promotion au niveau du produit
      let promo = promos.find(pr => pr.idProduit && pr.idProduit.toString() === produitId);
      
      // Priorité 2: promotion au niveau de la catégorie (vérifie toutes les catégories du produit)
      if (!promo && categorieIds.length > 0) {
        promo = promos.find(pr => pr.idCategorie && categorieIds.includes(pr.idCategorie.toString()) && !pr.idProduit);
      }
      
      // Priorité 3: promotion au niveau de la boutique
      if (!promo && boutiqueId) {
        promo = promos.find(pr => pr.idBoutique && pr.idBoutique.toString() === boutiqueId && !pr.idCategorie && !pr.idProduit);
      }

      if (promo) console.log(`  ✅ Promo trouvée: ${promo._id}`);
      else console.log(`  ❌ Aucune promo pour ce produit`);

      return {
        ...p.toJSON(),
        promotion: promo ? promo.toObject() : null,
      };
    });
  }
}

module.exports = PromotionService;