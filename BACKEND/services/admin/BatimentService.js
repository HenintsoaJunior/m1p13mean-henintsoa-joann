const batimentRepository = require("../../repositories/admin/BatimentRepository");

class BatimentService {
  async createBatiment(data) {
    return await batimentRepository.create(data);
  }

  async getAllBatiments(filters = {}, options = {}) {
    return await batimentRepository.findAll(filters, options);
  }

  async getBatimentById(id) {
    const batiment = await batimentRepository.findById(id);
    if (!batiment) {
      throw new Error("Bâtiment non trouvé");
    }
    return batiment;
  }

  async getBatimentsByCentre(centreId, options = {}) {
    return await batimentRepository.findByCentre(centreId, options);
  }

  async updateBatiment(id, data) {
    const batiment = await batimentRepository.update(id, data);
    if (!batiment) {
      throw new Error("Bâtiment non trouvé");
    }
    return batiment;
  }

  async deleteBatiment(id) {
    const batiment = await batimentRepository.deleteById(id);
    if (!batiment) {
      throw new Error("Bâtiment non trouvé");
    }
    return batiment;
  }
}

module.exports = new BatimentService();
