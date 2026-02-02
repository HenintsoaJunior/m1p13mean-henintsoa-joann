const etageRepository = require("../../repositories/admin/EtageRepository");

class EtageService {
  async createEtage(data) {
    return await etageRepository.create(data);
  }

  async getAllEtages(filters = {}, options = {}) {
    return await etageRepository.findAll(filters, options);
  }

  async getEtageById(id) {
    const etage = await etageRepository.findById(id);
    if (!etage) {
      throw new Error("Étage non trouvé");
    }
    return etage;
  }

  async getEtagesByBatiment(batimentId, options = {}) {
    return await etageRepository.findByBatiment(batimentId, options);
  }

  async updateEtage(id, data) {
    const etage = await etageRepository.update(id, data);
    if (!etage) {
      throw new Error("Étage non trouvé");
    }
    return etage;
  }

  async deleteEtage(id) {
    const etage = await etageRepository.deleteById(id);
    if (!etage) {
      throw new Error("Étage non trouvé");
    }
    return etage;
  }
}

module.exports = new EtageService();
