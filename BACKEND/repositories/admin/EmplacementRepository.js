const Emplacement = require("../../models/admin/Emplacement");

class EmplacementRepository {
  async create(data) {
    return await Emplacement.create(data);
  }

  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 10, sort = { code: 1 } } = options;
    const skip = (page - 1) * limit;

    const emplacements = await Emplacement.find(filters)
      .populate("etage_id", "nom niveau batiment_id")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Emplacement.countDocuments(filters);

    return { emplacements, total, page, pages: Math.ceil(total / limit) };
  }

  async findById(id) {
    return await Emplacement.findById(id).populate({
      path: "etage_id",
      populate: { path: "batiment_id", populate: { path: "centre_id" } }
    });
  }

  async findByEtage(etageId, options = {}) {
    return await this.findAll({ etage_id: etageId }, options);
  }

  async findByEtageId(etageId) {
    return await Emplacement.find({ etage_id: etageId }).sort({ code: 1 });
  }

  async findByStatut(statut, options = {}) {
    return await this.findAll({ statut }, options);
  }

  async update(id, data) {
    return await Emplacement.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteById(id) {
    return await Emplacement.findByIdAndDelete(id);
  }
}

module.exports = new EmplacementRepository();
