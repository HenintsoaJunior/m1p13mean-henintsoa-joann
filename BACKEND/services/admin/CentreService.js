const centreRepository = require("../../repositories/admin/CentreRepository");

class CentreService {
  async createCentre(data) {
    const existingCentre = await centreRepository.findBySlug(data.slug);
    if (existingCentre) {
      throw new Error("Un centre avec ce slug existe déjà");
    }
    return await centreRepository.create(data);
  }

  async getAllCentres(filters = {}, options = {}) {
    return await centreRepository.findAll(filters, options);
  }

  async getCentreById(id) {
    const centre = await centreRepository.findById(id);
    if (!centre) {
      throw new Error("Centre non trouvé");
    }
    return centre;
  }

  async getCentreBySlug(slug) {
    const centre = await centreRepository.findBySlug(slug);
    if (!centre) {
      throw new Error("Centre non trouvé");
    }
    return centre;
  }

  async updateCentre(id, data) {
    if (data.slug) {
      const existingCentre = await centreRepository.findBySlug(data.slug);
      if (existingCentre && existingCentre._id.toString() !== id) {
        throw new Error("Un centre avec ce slug existe déjà");
      }
    }
    const centre = await centreRepository.update(id, data);
    if (!centre) {
      throw new Error("Centre non trouvé");
    }
    return centre;
  }

  async deleteCentre(id) {
    const centre = await centreRepository.deleteById(id);
    if (!centre) {
      throw new Error("Centre non trouvé");
    }
    return centre;
  }

  async findNearCentres(longitude, latitude, maxDistance) {
    return await centreRepository.findNear(longitude, latitude, maxDistance);
  }
}

module.exports = new CentreService();
