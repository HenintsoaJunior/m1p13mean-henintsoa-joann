const Promotion = require("../../models/boutique/Promotion");

class PromotionRepository {
  async creer(donnees) {
    const promo = new Promotion(donnees);
    await promo.save();
    return promo;
  }

  async trouverParId(id) {
    return await Promotion.findById(id);
  }

  async trouverParBoutique(idBoutique, filtres = {}) {
    const query = { idBoutique };
    if (filtres.statut) query.statut = filtres.statut;
    if (filtres.activeOnly) {
      const now = new Date();
      query.dateDebut = { $lte: now };
      query.dateFin = { $gte: now };
    }
    return await Promotion.find(query).sort({ dateDebut: 1 });
  }

  async trouverActivesPourProduit(idProduit) {
    const now = new Date();
    return await Promotion.find({
      idProduit,
      statut: "active",
      dateDebut: { $lte: now },
      dateFin: { $gte: now },
    });
  }

  async mettreAJour(id, nouvellesDonnees) {
    return await Promotion.findByIdAndUpdate(id, nouvellesDonnees, { new: true });
  }

  async supprimer(id) {
    return await Promotion.findByIdAndDelete(id);
  }
}

module.exports = PromotionRepository;
