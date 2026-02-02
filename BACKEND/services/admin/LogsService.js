const logsRepository = require("../../repositories/admin/LogsRepository");

class LogsService {
  async createLog(utilisateurId, details) {
    return await logsRepository.create({
      utilisateur_id: utilisateurId,
      details
    });
  }

  async getAllLogs(filters = {}, options = {}) {
    return await logsRepository.findAll(filters, options);
  }

  async getLogById(id) {
    const log = await logsRepository.findById(id);
    if (!log) {
      throw new Error("Log non trouvé");
    }
    return log;
  }

  async getLogsByUtilisateur(utilisateurId, options = {}) {
    return await logsRepository.findByUtilisateur(utilisateurId, options);
  }

  async deleteLog(id) {
    const log = await logsRepository.deleteById(id);
    if (!log) {
      throw new Error("Log non trouvé");
    }
    return log;
  }
}

module.exports = new LogsService();
