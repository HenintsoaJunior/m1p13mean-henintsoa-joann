const batimentService = require("../../services/admin/BatimentService");

class BatimentController {
  async createBatiment(req, res) {
    try {
      const batiment = await batimentService.createBatiment(req.body);
      res.status(201).json({ success: true, data: batiment });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAllBatiments(req, res) {
    try {
      const { page, limit, sort, centre_id } = req.query;
      const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 10 };
      if (sort) options.sort = JSON.parse(sort);

      const filters = centre_id ? { centre_id } : {};
      const result = await batimentService.getAllBatiments(filters, options);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getBatimentById(req, res) {
    try {
      const batiment = await batimentService.getBatimentById(req.params.id);
      res.status(200).json({ success: true, data: batiment });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getBatimentsByCentre(req, res) {
    try {
      const { page, limit } = req.query;
      const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 10 };
      const result = await batimentService.getBatimentsByCentre(req.params.centreId, options);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateBatiment(req, res) {
    try {
      const batiment = await batimentService.updateBatiment(req.params.id, req.body);
      res.status(200).json({ success: true, data: batiment });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteBatiment(req, res) {
    try {
      const batiment = await batimentService.deleteBatiment(req.params.id);
      res.status(200).json({ success: true, message: "Bâtiment supprimé", data: batiment });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
}

module.exports = new BatimentController();
