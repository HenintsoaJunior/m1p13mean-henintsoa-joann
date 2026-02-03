const Batiment = require("../../models/admin/Batiment");

class BatimentRepository {
  async create(data) {
    return await Batiment.create(data);
  }

  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 10, sort = { cree_le: -1 } } = options;
    const skip = (page - 1) * limit;

    const batiments = await Batiment.find(filters)
      .populate("centre_id", "nom slug")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Batiment.countDocuments(filters);

    return { batiments, total, page, pages: Math.ceil(total / limit) };
  }

  async findById(id) {
    return await Batiment.findById(id).populate("centre_id");
  }

  async findByCentre(centreId, options = {}) {
    return await this.findAll({ centre_id: centreId }, options);
  }

  async findByCentreId(centreId) {
    return await Batiment.find({ centre_id: centreId }).sort({ nom: 1 });
  }

  async update(id, data) {
    return await Batiment.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteById(id) {
    return await Batiment.findByIdAndDelete(id);
  }
}

module.exports = new BatimentRepository();
