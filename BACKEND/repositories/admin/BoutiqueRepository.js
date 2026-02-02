const Boutique = require("../../models/admin/Boutique");

class BoutiqueRepository {
  async create(data) {
    return await Boutique.create(data);
  }

  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 10, sort = { _id: -1 } } = options;
    const skip = (page - 1) * limit;

    const boutiques = await Boutique.find(filters)
      .populate("appel_offre_id")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Boutique.countDocuments(filters);

    return { boutiques, total, page, pages: Math.ceil(total / limit) };
  }

  async findById(id) {
    return await Boutique.findById(id).populate({
      path: "appel_offre_id",
      populate: { path: "emplacement_id" }
    });
  }

  async findByAppelOffre(appelOffreId, options = {}) {
    return await this.findAll({ appel_offre_id: appelOffreId }, options);
  }

  async findByStatut(statut, options = {}) {
    return await this.findAll({ statut }, options);
  }

  async update(id, data) {
    return await Boutique.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteById(id) {
    return await Boutique.findByIdAndDelete(id);
  }
}

module.exports = new BoutiqueRepository();
