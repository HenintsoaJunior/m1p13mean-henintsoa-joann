const MouvementStock = require("../../models/boutique/MouvementStock");

class MouvementStockRepository {
  async creer(donnees) {
    const mouvement = new MouvementStock(donnees);
    await mouvement.save();
    return mouvement.populate([
      { path: "idProduit", select: "nom slug variantes" },
      { path: "utilisateur", select: "nom prenom email" },
    ]);
  }

  async trouverParBoutique(idBoutique, options = {}) {
    const { page = 1, limite = 20, idProduit, type } = options;
    const filtre = { idBoutique };
    if (idProduit) filtre.idProduit = idProduit;
    if (type) filtre.type = type;

    const [mouvements, total] = await Promise.all([
      MouvementStock.find(filtre)
        .populate("idProduit", "nom slug variantes")
        .populate("utilisateur", "nom prenom email")
        .sort({ dateCreation: -1 })
        .skip((parseInt(page) - 1) * parseInt(limite))
        .limit(parseInt(limite)),
      MouvementStock.countDocuments(filtre),
    ]);

    return {
      mouvements,
      pagination: {
        page: parseInt(page),
        limite: parseInt(limite),
        total,
        pages: Math.ceil(total / parseInt(limite)),
      },
    };
  }

  async trouverParProduit(idProduit, idBoutique) {
    return await MouvementStock.find({ idProduit, idBoutique })
      .populate("utilisateur", "nom prenom email")
      .sort({ dateCreation: -1 });
  }

  async statsParBoutique(idBoutique) {
    const stats = await MouvementStock.aggregate([
      { $match: { idBoutique: new (require("mongoose").Types.ObjectId)(idBoutique.toString()) } },
      {
        $group: {
          _id: "$type",
          totalQuantite: { $sum: "$quantite" },
          nombreMouvements: { $sum: 1 },
        },
      },
    ]);
    return stats;
  }
}

module.exports = MouvementStockRepository;
