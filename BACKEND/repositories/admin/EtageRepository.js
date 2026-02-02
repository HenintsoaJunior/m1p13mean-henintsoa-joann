const Etage = require("../../models/admin/Etage");

class EtageRepository {
  async create(data) {
    return await Etage.create(data);
  }

  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 10, sort = { niveau: 1 } } = options;
    const skip = (page - 1) * limit;

    const etages = await Etage.find(filters)
      .populate("batiment_id", "nom centre_id")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Etage.countDocuments(filters);

    return { etages, total, page, pages: Math.ceil(total / limit) };
  }

  async findById(id) {
    return await Etage.findById(id).populate("batiment_id");
  }

  async findByBatiment(batimentId, options = {}) {
    return await this.findAll({ batiment_id: batimentId }, options);
  }

  async update(id, data) {
    return await Etage.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteById(id) {
    return await Etage.findByIdAndDelete(id);
  }
}

module.exports = new EtageRepository();
