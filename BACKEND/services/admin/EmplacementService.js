const emplacementRepository = require("../../repositories/admin/EmplacementRepository");

class EmplacementService {
  async createEmplacement(data) {
    return await emplacementRepository.create(data);
  }

  async getAllEmplacements(filters = {}, options = {}) {
    return await emplacementRepository.findAll(filters, options);
  }

  async getEmplacementById(id) {
    const emplacement = await emplacementRepository.findById(id);
    if (!emplacement) {
      throw new Error("Emplacement non trouvé");
    }
    return emplacement;
  }

  async getEmplacementsByEtage(etageId, options = {}) {
    return await emplacementRepository.findByEtage(etageId, options);
  }

  async getEmplacementsByStatut(statut, options = {}) {
    return await emplacementRepository.findByStatut(statut, options);
  }

  async updateEmplacement(id, data) {
    const emplacement = await emplacementRepository.update(id, data);
    if (!emplacement) {
      throw new Error("Emplacement non trouvé");
    }
    return emplacement;
  }

  async deleteEmplacement(id) {
    const emplacement = await emplacementRepository.deleteById(id);
    if (!emplacement) {
      throw new Error("Emplacement non trouvé");
    }
    return emplacement;
  }
}

module.exports = new EmplacementService();
