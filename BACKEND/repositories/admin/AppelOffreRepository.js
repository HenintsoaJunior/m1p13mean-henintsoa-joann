const AppelOffre = require("../../models/admin/AppelOffre");

class AppelOffreRepository {
  async create(data) {
    return await AppelOffre.create(data);
  }

  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 10, sort = { date_appel: -1 } } = options;
    const skip = (page - 1) * limit;

    const appelsOffre = await AppelOffre.find(filters)
      .populate("emplacement_id")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await AppelOffre.countDocuments(filters);

    return { appelsOffre, total, page, pages: Math.ceil(total / limit) };
  }

  async findById(id) {
    return await AppelOffre.findById(id).populate({
      path: "emplacement_id",
      populate: { path: "etage_id", populate: { path: "batiment_id" } }
    });
  }

  async findByEmplacement(emplacementId, options = {}) {
    return await this.findAll({ emplacement_id: emplacementId }, options);
  }

  async findByStatut(statut, options = {}) {
    return await this.findAll({ statut }, options);
  }

  async update(id, data) {
    return await AppelOffre.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteById(id) {
    return await AppelOffre.findByIdAndDelete(id);
  }
}

module.exports = new AppelOffreRepository();
