const etageService = require("../../services/admin/EtageService");

class EtageController {
  async createEtage(req, res) {
    try {
      const etage = await etageService.createEtage(req.body);
      res.status(201).json({ success: true, data: etage });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAllEtages(req, res) {
    try {
      const { page, limit, sort, batiment_id } = req.query;
      const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 10 };
      if (sort) options.sort = JSON.parse(sort);

      const filters = batiment_id ? { batiment_id } : {};
      const result = await etageService.getAllEtages(filters, options);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getEtageById(req, res) {
    try {
      const etage = await etageService.getEtageById(req.params.id);
      res.status(200).json({ success: true, data: etage });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getEtagesByBatiment(req, res) {
    try {
      const { page, limit } = req.query;
      const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 10 };
      const result = await etageService.getEtagesByBatiment(req.params.batimentId, options);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateEtage(req, res) {
    try {
      const etage = await etageService.updateEtage(req.params.id, req.body);
      res.status(200).json({ success: true, data: etage });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteEtage(req, res) {
    try {
      const etage = await etageService.deleteEtage(req.params.id);
      res.status(200).json({ success: true, message: "Étage supprimé", data: etage });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
}

module.exports = new EtageController();
