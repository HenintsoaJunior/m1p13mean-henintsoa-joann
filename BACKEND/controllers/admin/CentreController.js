const centreService = require("../../services/admin/CentreService");

class CentreController {
  async createCentre(req, res) {
    try {
      const centre = await centreService.createCentre(req.body);
      res.status(201).json({ success: true, data: centre });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAllCentres(req, res) {
    try {
      const { page, limit, sort } = req.query;
      const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 10 };
      if (sort) options.sort = JSON.parse(sort);

      const result = await centreService.getAllCentres({}, options);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getCentreById(req, res) {
    try {
      const centre = await centreService.getCentreById(req.params.id);
      res.status(200).json({ success: true, data: centre });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getCentreBySlug(req, res) {
    try {
      const centre = await centreService.getCentreBySlug(req.params.slug);
      res.status(200).json({ success: true, data: centre });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async updateCentre(req, res) {
    try {
      const centre = await centreService.updateCentre(req.params.id, req.body);
      res.status(200).json({ success: true, data: centre });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteCentre(req, res) {
    try {
      const centre = await centreService.deleteCentre(req.params.id);
      res.status(200).json({ success: true, message: "Centre supprimé", data: centre });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async findNearCentres(req, res) {
    try {
      const { longitude, latitude, maxDistance } = req.query;
      const centres = await centreService.findNearCentres(
        parseFloat(longitude),
        parseFloat(latitude),
        parseInt(maxDistance) || 10000
      );
      res.status(200).json({ success: true, data: centres });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getCentreWithPlan(req, res) {
    try {
      const centreId = req.params.id;
      const centreWithPlan = await centreService.getCentreWithPlan(centreId);
      res.status(200).json({ success: true, data: centreWithPlan });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
}

module.exports = new CentreController();
