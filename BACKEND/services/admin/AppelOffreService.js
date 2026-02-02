const appelOffreRepository = require("../../repositories/admin/AppelOffreRepository");

class AppelOffreService {
  async createAppelOffre(data) {
    return await appelOffreRepository.create(data);
  }

  async getAllAppelsOffre(filters = {}, options = {}) {
    return await appelOffreRepository.findAll(filters, options);
  }

  async getAppelOffreById(id) {
    const appelOffre = await appelOffreRepository.findById(id);
    if (!appelOffre) {
      throw new Error("Appel d'offre non trouvé");
    }
    return appelOffre;
  }

  async getAppelsOffreByEmplacement(emplacementId, options = {}) {
    return await appelOffreRepository.findByEmplacement(emplacementId, options);
  }

  async getAppelsOffreByStatut(statut, options = {}) {
    return await appelOffreRepository.findByStatut(statut, options);
  }

  async updateAppelOffre(id, data) {
    const appelOffre = await appelOffreRepository.update(id, data);
    if (!appelOffre) {
      throw new Error("Appel d'offre non trouvé");
    }
    return appelOffre;
  }

  async deleteAppelOffre(id) {
    const appelOffre = await appelOffreRepository.deleteById(id);
    if (!appelOffre) {
      throw new Error("Appel d'offre non trouvé");
    }
    return appelOffre;
  }
}

module.exports = new AppelOffreService();
