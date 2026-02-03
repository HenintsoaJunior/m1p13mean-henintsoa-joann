const centreRepository = require("../../repositories/admin/CentreRepository");
const batimentRepository = require("../../repositories/admin/BatimentRepository");
const etageRepository = require("../../repositories/admin/EtageRepository");
const emplacementRepository = require("../../repositories/admin/EmplacementRepository");

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

  async getCentreWithPlan(centreId) {
    // Récupérer le centre
    const centre = await centreRepository.findById(centreId);
    if (!centre) {
      throw new Error("Centre non trouvé");
    }

    // Récupérer tous les bâtiments du centre
    const batiments = await batimentRepository.findByCentreId(centreId);

    // Pour chaque bâtiment, récupérer ses étages et emplacements
    const batimentsWithDetails = await Promise.all(
      batiments.map(async (batiment) => {
        const etages = await etageRepository.findByBatimentId(batiment._id);
        
        // Pour chaque étage, récupérer ses emplacements
        const etagesWithEmplacements = await Promise.all(
          etages.map(async (etage) => {
            const emplacements = await emplacementRepository.findByEtageId(etage._id);
            return {
              ...etage.toObject(),
              emplacements
            };
          })
        );

        return {
          ...batiment.toObject(),
          etages: etagesWithEmplacements
        };
      })
    );

    return {
      centre,
      batiments: batimentsWithDetails
    };
  }
}

module.exports = new CentreService();
