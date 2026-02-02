const boutiqueRepository = require("../../repositories/admin/BoutiqueRepository");

class BoutiqueService {
  async createBoutique(data) {
    return await boutiqueRepository.create(data);
  }

  async getAllBoutiques(filters = {}, options = {}) {
    return await boutiqueRepository.findAll(filters, options);
  }

  async getBoutiqueById(id) {
    const boutique = await boutiqueRepository.findById(id);
    if (!boutique) {
      throw new Error("Boutique non trouvée");
    }
    return boutique;
  }

  async getBoutiquesByAppelOffre(appelOffreId, options = {}) {
    return await boutiqueRepository.findByAppelOffre(appelOffreId, options);
  }

  async getBoutiquesByStatut(statut, options = {}) {
    return await boutiqueRepository.findByStatut(statut, options);
  }

  async updateBoutique(id, data) {
    const boutique = await boutiqueRepository.update(id, data);
    if (!boutique) {
      throw new Error("Boutique non trouvée");
    }
    return boutique;
  }

  async deleteBoutique(id) {
    const boutique = await boutiqueRepository.deleteById(id);
    if (!boutique) {
      throw new Error("Boutique non trouvée");
    }
    return boutique;
  }
}

module.exports = new BoutiqueService();
