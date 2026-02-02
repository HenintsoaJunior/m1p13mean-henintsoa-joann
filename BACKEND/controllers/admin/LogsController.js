const logsService = require("../../services/admin/LogsService");

class LogsController {
  async createLog(req, res) {
    try {
      const { utilisateur_id, details } = req.body;
      const log = await logsService.createLog(utilisateur_id, details);
      res.status(201).json({ success: true, data: log });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAllLogs(req, res) {
    try {
      const { page, limit, sort } = req.query;
      const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 10 };
      if (sort) options.sort = JSON.parse(sort);

      const result = await logsService.getAllLogs({}, options);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getLogById(req, res) {
    try {
      const log = await logsService.getLogById(req.params.id);
      res.status(200).json({ success: true, data: log });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getLogsByUtilisateur(req, res) {
    try {
      const { page, limit } = req.query;
      const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 10 };
      const result = await logsService.getLogsByUtilisateur(req.params.utilisateurId, options);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteLog(req, res) {
    try {
      const log = await logsService.deleteLog(req.params.id);
      res.status(200).json({ success: true, message: "Log supprimé", data: log });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
}

module.exports = new LogsController();
