const Commande = require("../../models/boutique/Commande");

class CommandeRepository {
  async creer(data) {
    const commande = new Commande(data);
    await commande.save();
    return commande;
  }

  async trouverParBoutique(idBoutique, options = {}) {
    const { statut, page = 1, limite = 15 } = options;
    const filtre = { idBoutique };
    if (statut) filtre.statut = statut;

    const skip = (parseInt(page) - 1) * parseInt(limite);
    const total = await Commande.countDocuments(filtre);
    const commandes = await Commande.find(filtre)
      .populate("lignes.idProduit", "nom images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limite));

    return {
      commandes,
      pagination: {
        total,
        page: parseInt(page),
        limite: parseInt(limite),
        pages: Math.ceil(total / parseInt(limite)),
      },
    };
  }

  async trouverParId(id) {
    return await Commande.findById(id).populate("lignes.idProduit", "nom images variantes");
  }

  async mettreAJour(id, data) {
    return await Commande.findByIdAndUpdate(id, data, { new: true });
  }

  async supprimer(id) {
    return await Commande.findByIdAndDelete(id);
  }

  async stats(idBoutique) {
    const totalCommandes = await Commande.countDocuments({ idBoutique });

    const parStatut = await Commande.aggregate([
      { $match: { idBoutique: require("mongoose").Types.ObjectId.createFromHexString(idBoutique.toString()) } },
      { $group: { _id: "$statut", count: { $sum: 1 }, ca: { $sum: "$total" } } },
    ]);

    const caTotal = parStatut.reduce((sum, s) => sum + s.ca, 0);
    const enAttente = parStatut.find((s) => s._id === "en_attente")?.count || 0;

    return { totalCommandes, caTotal, enAttente, parStatut };
  }
}

module.exports = CommandeRepository;
