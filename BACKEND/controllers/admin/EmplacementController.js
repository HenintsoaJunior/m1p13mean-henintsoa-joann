const emplacementService = require("../../services/admin/EmplacementService");

class EmplacementController {
  async createEmplacement(req, res) {
    try {
      console.log('=== CREATE EMPLACEMENT ===');
      console.log('Données reçues:', JSON.stringify(req.body, null, 2));
      const emplacement = await emplacementService.createEmplacement(req.body);
      console.log('Emplacement créé:', emplacement);
      res.status(201).json({ success: true, data: emplacement });
    } catch (error) {
      console.error('Erreur création emplacement:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAllEmplacements(req, res) {
    try {
      const { page, limit, sort, etage_id, statut } = req.query;
      const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 10 };
      if (sort) options.sort = JSON.parse(sort);

      const filters = {};
      if (etage_id) filters.etage_id = etage_id;
      if (statut) filters.statut = statut;

      const result = await emplacementService.getAllEmplacements(filters, options);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getEmplacementById(req, res) {
    try {
      const emplacement = await emplacementService.getEmplacementById(req.params.id);
      res.status(200).json({ success: true, data: emplacement });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getEmplacementsByEtage(req, res) {
    try {
      const { page, limit } = req.query;
      const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 10 };
      const result = await emplacementService.getEmplacementsByEtage(req.params.etageId, options);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getEmplacementsByStatut(req, res) {
    try {
      const { page, limit } = req.query;
      const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 10 };
      const result = await emplacementService.getEmplacementsByStatut(req.params.statut, options);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateEmplacement(req, res) {
    try {
      const emplacement = await emplacementService.updateEmplacement(req.params.id, req.body);
      res.status(200).json({ success: true, data: emplacement });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteEmplacement(req, res) {
    try {
      const emplacement = await emplacementService.deleteEmplacement(req.params.id);
      res.status(200).json({ success: true, message: "Emplacement supprimé", data: emplacement });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
}

module.exports = new EmplacementController();
