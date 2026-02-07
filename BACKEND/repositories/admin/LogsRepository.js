const Logs = require("../../models/admin/Logs");

class LogsRepository {
  async create(data) {
    return await Logs.create(data);
  }

  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 10, sort = { dateHeure: -1 } } = options;
    const skip = (page - 1) * limit;

    const logs = await Logs.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Logs.countDocuments(filters);

    return { logs, total, page, pages: Math.ceil(total / limit) };
  }

  async findById(id) {
    return await Logs.findById(id);
  }

  async findByUtilisateur(utilisateurId, options = {}) {
    return await this.findAll({ utilisateurId: utilisateurId }, options);
  }

  async deleteById(id) {
    return await Logs.findByIdAndDelete(id);
  }
}

module.exports = new LogsRepository();
