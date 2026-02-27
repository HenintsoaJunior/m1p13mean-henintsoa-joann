const Reponse = require("../../models/admin/ReponseAppelOffre");

class ReponseRepository {
  async create(data) {
    return await Reponse.create(data);
  }

  async findByAppelOffre(appelOffreId, options = {}) {
    const { page = 1, limit = 50, sort = { _id: -1 } } = options;
    const skip = (page - 1) * limit;
    const docs = await Reponse.find({ appel_offre_id: appelOffreId }).sort(sort).skip(skip).limit(limit);
    const total = await Reponse.countDocuments({ appel_offre_id: appelOffreId });
    return { reponses: docs, total, page, pages: Math.ceil(total / limit) };
  }

  async findById(id) {
    return await Reponse.findById(id);
  }

  async update(id, data) {
    return await Reponse.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async updateMany(filter, data) {
    return await Reponse.updateMany(filter, data);
  }
}

module.exports = new ReponseRepository();
