const reponseService = require("../../services/admin/ReponseAppelOffreService");

class ReponseController {
  async createReponse(req, res) {
    try {
      // autor: boutique or admin
      const payload = { ...req.body };
      // optional: allow boutique users to set boutique_id from their account
      if (req.utilisateur && req.utilisateur.role === "boutique") {
        payload.boutique_id = req.utilisateur._id;
      }

      const resultat = await reponseService.createReponse(payload);
      res.status(201).json({ success: true, data: resultat });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getReponsesByAppel(req, res) {
    try {
      const { appelId } = req.params;
      const result = await reponseService.getReponsesByAppel(appelId, req.query);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async acceptReponse(req, res) {
    try {
      const { id } = req.params;
      const result = await reponseService.acceptReponse(id);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async refuseReponse(req, res) {
    try {
      const { id } = req.params;
      const result = await reponseService.refuseReponse(id);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ReponseController();
