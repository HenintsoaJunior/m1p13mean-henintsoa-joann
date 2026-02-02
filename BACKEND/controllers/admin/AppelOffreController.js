const appelOffreService = require("../../services/admin/AppelOffreService");

class AppelOffreController {
  async createAppelOffre(req, res) {
    try {
      const appelOffre = await appelOffreService.createAppelOffre(req.body);
      res.status(201).json({ success: true, data: appelOffre });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAllAppelsOffre(req, res) {
    try {
      const { page, limit, sort, emplacement_id, statut } = req.query;
      const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 10 };
      if (sort) options.sort = JSON.parse(sort);

      const filters = {};
      if (emplacement_id) filters.emplacement_id = emplacement_id;
      if (statut) filters.statut = statut;

      const result = await appelOffreService.getAllAppelsOffre(filters, options);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAppelOffreById(req, res) {
    try {
      const appelOffre = await appelOffreService.getAppelOffreById(req.params.id);
      res.status(200).json({ success: true, data: appelOffre });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getAppelsOffreByEmplacement(req, res) {
    try {
      const { page, limit } = req.query;
      const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 10 };
      const result = await appelOffreService.getAppelsOffreByEmplacement(req.params.emplacementId, options);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAppelsOffreByStatut(req, res) {
    try {
      const { page, limit } = req.query;
      const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 10 };
      const result = await appelOffreService.getAppelsOffreByStatut(req.params.statut, options);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateAppelOffre(req, res) {
    try {
      const appelOffre = await appelOffreService.updateAppelOffre(req.params.id, req.body);
      res.status(200).json({ success: true, data: appelOffre });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteAppelOffre(req, res) {
    try {
      const appelOffre = await appelOffreService.deleteAppelOffre(req.params.id);
      res.status(200).json({ success: true, message: "Appel d'offre supprimé", data: appelOffre });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AppelOffreController();
