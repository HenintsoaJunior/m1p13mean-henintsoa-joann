const boutiqueService = require("../../services/admin/BoutiqueService");

class BoutiqueController {
  async createBoutique(req, res) {
    try {
      const boutique = await boutiqueService.createBoutique(req.body);
      res.status(201).json({ success: true, data: boutique });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAllBoutiques(req, res) {
    try {
      const { page, limit, sort, appel_offre_id, statut } = req.query;
      const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 10 };
      if (sort) options.sort = JSON.parse(sort);

      const filters = {};
      if (appel_offre_id) filters.appel_offre_id = appel_offre_id;
      if (statut) filters.statut = statut;

      const result = await boutiqueService.getAllBoutiques(filters, options);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getBoutiqueById(req, res) {
    try {
      const boutique = await boutiqueService.getBoutiqueById(req.params.id);
      res.status(200).json({ success: true, data: boutique });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getBoutiquesByAppelOffre(req, res) {
    try {
      const { page, limit } = req.query;
      const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 10 };
      const result = await boutiqueService.getBoutiquesByAppelOffre(req.params.appelOffreId, options);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getBoutiquesByStatut(req, res) {
    try {
      const { page, limit } = req.query;
      const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 10 };
      const result = await boutiqueService.getBoutiquesByStatut(req.params.statut, options);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateBoutique(req, res) {
    try {
      const boutique = await boutiqueService.updateBoutique(req.params.id, req.body);
      res.status(200).json({ success: true, data: boutique });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteBoutique(req, res) {
    try {
      const boutique = await boutiqueService.deleteBoutique(req.params.id);
      res.status(200).json({ success: true, message: "Boutique supprimée", data: boutique });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async desactiverBoutique(req, res) {
    try {
      const boutique = await boutiqueService.desactiverBoutique(req.params.id);
      res.status(200).json({ success: true, message: "Boutique désactivée avec succès", data: boutique });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async reactiverBoutique(req, res) {
    try {
      const boutique = await boutiqueService.reactiverBoutique(req.params.id);
      res.status(200).json({ success: true, message: "Boutique réactivée avec succès", data: boutique });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new BoutiqueController();
