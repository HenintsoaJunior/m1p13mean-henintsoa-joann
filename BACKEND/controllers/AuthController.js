const UtilisateurService = require("../services/UtilisateurService");

class AuthController {
  constructor() {
    this.utilisateurService = new UtilisateurService();
  }

  /**
   * Contrôleur d'authentification
   * Responsabilité: Validation HTTP + Délégation aux services
   */

  /**
   * Inscription d'un nouvel utilisateur
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async inscription(req, res) {
    try {
      const resultat = await this.utilisateurService.inscrire(req.body);
      res.status(201).json(resultat);
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      res.status(400).json({
        erreur: error.message || "Erreur serveur lors de l'inscription",
      });
    }
  }

  /**
   * Connexion d'un utilisateur
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async connexion(req, res) {
    try {
      const { email, mot_de_passe } = req.body;
      
      // Vérifier si une restriction de rôle est présente dans la requête
      const roleRestreint = req.headers['x-role-restriction'];
      
      const resultat = await this.utilisateurService.connecter(
        email,
        mot_de_passe,
      );
      
      // Si une restriction de rôle est présente, vérifier que l'utilisateur correspond
      if (roleRestreint && resultat.utilisateur.role !== roleRestreint) {
        return res.status(403).json({
          erreur: `Accès refusé. Ce compte est de type ${resultat.utilisateur.role}, mais vous essayez d'accéder à l'espace ${roleRestreint}.`
        });
      }
      
      res.json(resultat);
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      res.status(400).json({
        erreur: error.message || "Erreur lors de la connexion",
      });
    }
  }

  /**
   * Obtenir le profil de l'utilisateur connecté
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async obtenirProfil(req, res) {
    try {
      res.json({
        utilisateur: req.utilisateur.toJSON(),
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      res.status(500).json({
        erreur: "Erreur serveur lors de la récupération du profil",
      });
    }
  }

  /**
   * Mettre à jour le profil de l'utilisateur connecté
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async mettreAJourProfil(req, res) {
    try {
      const resultat = await this.utilisateurService.mettreAJourProfil(
        req.utilisateur._id,
        req.body,
      );
      res.json(resultat);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      res.status(400).json({
        erreur:
          error.message || "Erreur serveur lors de la mise à jour du profil",
      });
    }
  }

  /**
   * Changer le mot de passe de l'utilisateur connecté
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async changerMotDePasse(req, res) {
    try {
      const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;
      const resultat = await this.utilisateurService.changerMotDePasse(
        req.utilisateur._id,
        ancien_mot_de_passe,
        nouveau_mot_de_passe,
      );
      res.json(resultat);
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      res.status(400).json({
        erreur:
          error.message || "Erreur serveur lors du changement de mot de passe",
      });
    }
  }

  /**
   * Demander la réinitialisation du mot de passe
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async demanderReinitialisationMotDePasse(req, res) {
    try {
      const { email } = req.body;
      const resultat =
        await this.utilisateurService.demanderReinitialisationMotDePasse(email);
      res.json(resultat);
    } catch (error) {
      console.error("Erreur lors de la demande de réinitialisation:", error);
      res.status(400).json({
        erreur:
          error.message ||
          "Erreur serveur lors de la demande de réinitialisation",
      });
    }
  }

  /**
   * Réinitialiser le mot de passe avec le token
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async reinitialiserMotDePasse(req, res) {
    try {
      const { token, nouveau_mot_de_passe } = req.body;
      const resultat = await this.utilisateurService.reinitialiserMotDePasse(
        token,
        nouveau_mot_de_passe,
      );
      res.json(resultat);
    } catch (error) {
      console.error(
        "Erreur lors de la réinitialisation du mot de passe:",
        error,
      );
      res.status(400).json({
        erreur:
          error.message ||
          "Erreur serveur lors de la réinitialisation du mot de passe",
      });
    }
  }

  /**
   * Obtenir la liste des utilisateurs (Admin seulement)
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async obtenirListeUtilisateurs(req, res) {
    try {
      const filtres = {
        role: req.query.role,
        actif: req.query.actif,
      };

      const pagination = {
        page: req.query.page || 1,
        limite: req.query.limite || 10,
      };

      const resultat = await this.utilisateurService.obtenirListeUtilisateurs(
        filtres,
        pagination,
      );
      res.json(resultat);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      res.status(500).json({
        erreur: "Erreur serveur lors de la récupération des utilisateurs",
      });
    }
  }

  /**
   * Activer/désactiver un utilisateur (Admin seulement)
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async modifierStatutUtilisateur(req, res) {
    try {
      const { actif } = req.body;
      const resultat = await this.utilisateurService.modifierStatutUtilisateur(
        req.params.id,
        actif,
      );
      res.json(resultat);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      const statusCode = error.message === "Utilisateur non trouvé" ? 404 : 500;
      res.status(statusCode).json({
        erreur:
          error.message || "Erreur serveur lors de la mise à jour du statut",
      });
    }
  }
}

module.exports = AuthController;
