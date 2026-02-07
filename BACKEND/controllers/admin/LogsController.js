const Log = require('../../models/admin/Logs');
const Utilisateur = require('../../models/Utilisateur');

const logController = {
  // Récupérer tous les logs
  getAllLogs: async (req, res) => {
    try {
      const { page, limit } = req.query;
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const skip = (pageNum - 1) * limitNum;

      const total = await Log.countDocuments();
      const logs = await Log.find()
        .sort({ dateHeure: -1 })
        .skip(skip)
        .limit(limitNum);
      
      const enhancedLogs = await Promise.all(logs.map(async (log) => {
        if (typeof log.utilisateurId === 'string' && log.utilisateurId !== '0') {
          try {
            const user = await Utilisateur.findById(log.utilisateurId).select('nom email role');
            return {
              ...log.toObject(),
              utilisateur: user ? { nom: user.nom, email: user.email, role: user.role } : null
            };
          } catch (error) {
            return {
              ...log.toObject(),
              utilisateur: null
            };
          }
        } else {
          return log.toObject();
        }
      }));
      
      res.status(200).json({
        success: true,
        data: enhancedLogs,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      });
    } catch (error) {
      console.error('Erreur récupération logs:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des logs',
        error: error.message
      });
    }
  },

  // Récupérer les logs par entité
  getLogsByEntity: async (req, res) => {
    try {
      const { entity } = req.params;
      const { page, limit } = req.query;
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const skip = (pageNum - 1) * limitNum;

      const total = await Log.countDocuments({ entite: entity });
      const logs = await Log.find({ entite: entity })
        .sort({ dateHeure: -1 })
        .skip(skip)
        .limit(limitNum);
      
      const enhancedLogs = await Promise.all(logs.map(async (log) => {
        if (typeof log.utilisateurId === 'string' && log.utilisateurId !== '0') {
          try {
            const user = await Utilisateur.findById(log.utilisateurId).select('nom email role');
            return {
              ...log.toObject(),
              utilisateur: user ? { nom: user.nom, email: user.email, role: user.role } : null
            };
          } catch (error) {
            return {
              ...log.toObject(),
              utilisateur: null
            };
          }
        } else {
          return log.toObject();
        }
      }));
      
      res.status(200).json({
        success: true,
        data: enhancedLogs,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      });
    } catch (error) {
      console.error('Erreur récupération logs par entité:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des logs',
        error: error.message
      });
    }
  },

  // Récupérer les logs par action
  getLogsByAction: async (req, res) => {
    try {
      const { action } = req.params;
      const { page, limit } = req.query;
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const skip = (pageNum - 1) * limitNum;

      const total = await Log.countDocuments({ action });
      const logs = await Log.find({ action })
        .sort({ dateHeure: -1 })
        .skip(skip)
        .limit(limitNum);
      
      const enhancedLogs = await Promise.all(logs.map(async (log) => {
        if (typeof log.utilisateurId === 'string' && log.utilisateurId !== '0') {
          try {
            const user = await Utilisateur.findById(log.utilisateurId).select('nom email role');
            return {
              ...log.toObject(),
              utilisateur: user ? { nom: user.nom, email: user.email, role: user.role } : null
            };
          } catch (error) {
            return {
              ...log.toObject(),
              utilisateur: null
            };
          }
        } else {
          return log.toObject();
        }
      }));
      
      res.status(200).json({
        success: true,
        data: enhancedLogs,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      });
    } catch (error) {
      console.error('Erreur récupération logs par action:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des logs',
        error: error.message
      });
    }
  },

  // Créer un nouveau log
  createLog: async (req, res) => {
    try {
      const { utilisateurId, action, entite, entiteId, ancienneValeur, nouvelleValeur } = req.body;
      
      // Vérifier s'il existe déjà un log similaire récemment pour éviter les doublons
      const existingLog = await Log.findOne({
        utilisateurId,
        action,
        entite,
        entiteId,
        dateHeure: { $gte: new Date(Date.now() - 1000) }
      });
      
      if (existingLog) {
        return res.status(200).json({
          success: true,
          message: 'Log dupliqué évité',
          data: existingLog
        });
      }
      
      const newLog = new Log({
        utilisateurId,
        action,
        entite,
        entiteId,
        ancienneValeur,
        nouvelleValeur,
        adresseIp: req.ip,
        navigateur: req.get('User-Agent')
      });
      
      const savedLog = await newLog.save();
      
      res.status(201).json({
        success: true,
        data: savedLog
      });
    } catch (error) {
      console.error('Erreur création log:', error);
      res.status(400).json({
        success: false,
        message: 'Erreur lors de la création du log',
        error: error.message
      });
    }
  }
};

module.exports = logController;
