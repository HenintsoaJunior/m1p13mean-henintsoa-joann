const UtilisateurRepository = require("../repositories/UtilisateurRepository");
const { genererToken } = require("../utils/jwt");

class UtilisateurService {
  constructor() {
    this.utilisateurRepository = new UtilisateurRepository();
  }

  /**
   * Service pour la logique métier des utilisateurs
   * Pure logique métier, indépendant de la base de données
   */

  /**
   * Inscrire un nouvel utilisateur
   * @param {Object} donneesUtilisateur - Données de l'utilisateur
   * @returns {Promise<Object>} Résultat de l'inscription
   */
  async inscrire(donneesUtilisateur) {
    const { email, mot_de_passe, prenom, nom, telephone, role } =
      donneesUtilisateur;

    // Logique métier : validation et nettoyage des données
    const donneesNettoyees = this.nettoyerDonneesInscription({
      email,
      mot_de_passe,
      prenom,
      nom,
      telephone,
      role,
    });

    // Vérification de l'unicité de l'email
    await this.verifierEmailUnique(donneesNettoyees.email);

    // Création de l'utilisateur
    const nouvelUtilisateur =
      await this.utilisateurRepository.creer(donneesNettoyees);

    // Génération du token
    const token = genererToken(nouvelUtilisateur._id);

    // TODO: Envoyer email de bienvenue
    // await this.emailService.envoyerBienvenue(nouvelUtilisateur);

    return {
      message: "Utilisateur créé avec succès",
      token,
      utilisateur: nouvelUtilisateur.toJSON(),
    };
  }

  /**
   * Connecter un utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} motDePasse - Mot de passe
   * @returns {Promise<Object>} Résultat de la connexion
   */
  async connecter(email, motDePasse) {
    // Validation métier des paramètres
    this.validerParametresConnexion(email, motDePasse);

    // Recherche et validation des identifiants
    const utilisateur = await this.utilisateurRepository.trouverParIdentifiants(
      email,
      motDePasse,
    );

    // Vérification du statut actif
    if (!this.estUtilisateurActif(utilisateur)) {
      throw new Error("Compte désactivé. Contactez l'administrateur.");
    }

    // Génération du token
    const token = genererToken(utilisateur._id);

    // TODO: Logger la connexion
    // await this.loggerConnexion(utilisateur);

    return {
      message: "Connexion réussie",
      token,
      utilisateur: utilisateur.toJSON(),
    };
  }

  /**
   * Mettre à jour le profil d'un utilisateur
   * @param {string} utilisateurId - ID de l'utilisateur
   * @param {Object} nouvellesDonnees - Nouvelles données
   * @returns {Promise<Object>} Utilisateur mis à jour
   */
  async mettreAJourProfil(utilisateurId, nouvellesDonnees) {
    // Récupération de l'utilisateur
    const utilisateur =
      await this.utilisateurRepository.trouverParId(utilisateurId);
    if (!utilisateur) {
      throw new Error("Utilisateur non trouvé");
    }

    // Nettoyage et validation des données
    const donneesNettoyees = this.nettoyerDonneesProfil(nouvellesDonnees);

    // Vérification de l'email si modifié
    if (
      donneesNettoyees.email &&
      donneesNettoyees.email !== utilisateur.email
    ) {
      if (
        await this.utilisateurRepository.emailExiste(
          donneesNettoyees.email,
          utilisateur._id,
        )
      ) {
        throw new Error("Un utilisateur avec cet email existe déjà");
      }
    }

    // Application des modifications
    this.appliquerModificationsProfil(utilisateur, donneesNettoyees);

    // Sauvegarde
    const utilisateurMisAJour =
      await this.utilisateurRepository.mettreAJour(utilisateur);

    return {
      message: "Profil mis à jour avec succès",
      utilisateur: utilisateurMisAJour.toJSON(),
    };
  }

  /**
   * Changer le mot de passe d'un utilisateur
   * @param {string} utilisateurId - ID de l'utilisateur
   * @param {string} ancienMotDePasse - Ancien mot de passe
   * @param {string} nouveauMotDePasse - Nouveau mot de passe
   * @returns {Promise<Object>} Résultat du changement
   */
  async changerMotDePasse(utilisateurId, ancienMotDePasse, nouveauMotDePasse) {
    // Récupération de l'utilisateur
    const utilisateur =
      await this.utilisateurRepository.trouverParId(utilisateurId);
    if (!utilisateur) {
      throw new Error("Utilisateur non trouvé");
    }

    // Validation métier des mots de passe
    this.validerChangementMotDePasse(ancienMotDePasse, nouveauMotDePasse);

    // Vérification de l'ancien mot de passe
    const estValide = await utilisateur.comparerMotDePasse(ancienMotDePasse);
    if (!estValide) {
      throw new Error("Ancien mot de passe incorrect");
    }

    // Application du nouveau mot de passe
    utilisateur.mot_de_passe = nouveauMotDePasse;
    await this.utilisateurRepository.mettreAJour(utilisateur);

    // TODO: Logger le changement et notifier par email
    // await this.loggerChangementMotDePasse(utilisateur);
    // await this.emailService.notifierChangementMotDePasse(utilisateur);

    return {
      message: "Mot de passe changé avec succès",
    };
  }

  /**
   * Demander la réinitialisation d'un mot de passe
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise<Object>} Résultat de la demande
   */
  async demanderReinitialisationMotDePasse(email) {
    // Recherche de l'utilisateur
    const utilisateur = await this.utilisateurRepository.trouverParEmail(email);
    if (!utilisateur) {
      throw new Error("Aucun utilisateur actif trouvé avec cet email");
    }

    // Génération du token de réinitialisation
    const token =
      await this.utilisateurRepository.genererTokenReinitialisation(
        utilisateur,
      );

    // TODO: Envoyer le token par email
    // await this.emailService.envoyerTokenReinitialisation(utilisateur, token);
    console.log(`Token de réinitialisation pour ${email}: ${token}`);

    return {
      message: "Token de réinitialisation généré. Vérifiez votre email.",
      // Retourner le token uniquement en développement
      token: process.env.NODE_ENV === "development" ? token : undefined,
    };
  }

  /**
   * Réinitialiser un mot de passe avec token
   * @param {string} token - Token de réinitialisation
   * @param {string} nouveauMotDePasse - Nouveau mot de passe
   * @returns {Promise<Object>} Résultat de la réinitialisation
   */
  async reinitialiserMotDePasse(token, nouveauMotDePasse) {
    // Validation métier du mot de passe
    this.validerMotDePasse(nouveauMotDePasse);

    // Recherche de l'utilisateur avec le token
    const utilisateur =
      await this.utilisateurRepository.trouverParTokenReinitialisation(token);
    if (!utilisateur) {
      throw new Error("Token de réinitialisation invalide ou expiré");
    }

    // Application du nouveau mot de passe et nettoyage du token
    utilisateur.mot_de_passe = nouveauMotDePasse;
    await this.utilisateurRepository.effacerTokenReinitialisation(utilisateur);

    // TODO: Logger et notifier
    // await this.loggerReinitialisationMotDePasse(utilisateur);
    // await this.emailService.confirmerReinitialisationMotDePasse(utilisateur);

    return {
      message: "Mot de passe réinitialisé avec succès",
    };
  }

  /**
   * Obtenir la liste des utilisateurs avec pagination
   * @param {Object} filtres - Filtres de recherche
   * @param {Object} pagination - Options de pagination
   * @returns {Promise<Object>} Liste paginée des utilisateurs
   */
  async obtenirListeUtilisateurs(filtres, pagination) {
    // Validation et nettoyage des filtres
    const filtresValides = this.validerFiltresListe(filtres);
    const paginationValide = this.validerPagination(pagination);

    return await this.utilisateurRepository.obtenirListeAvecPagination(
      filtresValides,
      paginationValide,
    );
  }

  /**
   * Modifier le statut d'un utilisateur
   * @param {string} utilisateurId - ID de l'utilisateur
   * @param {boolean} nouveauStatut - Nouveau statut
   * @returns {Promise<Object>} Résultat de la modification
   */
  async modifierStatutUtilisateur(utilisateurId, nouveauStatut) {
    // Récupération de l'utilisateur
    const utilisateur =
      await this.utilisateurRepository.trouverParId(utilisateurId);
    if (!utilisateur) {
      throw new Error("Utilisateur non trouvé");
    }

    // Validation métier du changement de statut
    this.validerChangementStatut(utilisateur, nouveauStatut);

    // Application du nouveau statut
    utilisateur.actif = nouveauStatut;
    const utilisateurMisAJour =
      await this.utilisateurRepository.mettreAJour(utilisateur);

    // TODO: Logger et notifier
    // await this.loggerChangementStatut(utilisateur, nouveauStatut);

    return {
      message: `Utilisateur ${nouveauStatut ? "activé" : "désactivé"} avec succès`,
      utilisateur: utilisateurMisAJour.toJSON(),
    };
  }

  // ========== MÉTHODES DE LOGIQUE MÉTIER ==========

  /**
   * Vérifier si l'utilisateur est actif (logique métier)
   * @param {Object} utilisateur - Instance de l'utilisateur
   * @returns {boolean} True si actif
   */
  estUtilisateurActif(utilisateur) {
    return utilisateur.actif === true;
  }

  /**
   * Obtenir le nom complet (logique métier de formatage)
   * @param {Object} utilisateur - Instance de l'utilisateur
   * @returns {string} Nom complet
   */
  obtenirNomComplet(utilisateur) {
    return `${utilisateur.prenom} ${utilisateur.nom}`;
  }

  /**
   * Vérifier les permissions par rôle (logique métier d'autorisation)
   * @param {Object} utilisateur - Instance de l'utilisateur
   * @param {string} roleRequis - Rôle requis
   * @returns {boolean} True si autorisé
   */
  peutAccederAuxDonnees(utilisateur, roleRequis) {
    const hierarchie = { client: 1, boutique: 2, admin: 3 };
    return hierarchie[utilisateur.role] >= hierarchie[roleRequis];
  }

  // ========== MÉTHODES PRIVÉES DE VALIDATION ==========

  /**
   * Vérifier l'unicité de l'email
   * @param {string} email - Email à vérifier
   * @private
   */
  async verifierEmailUnique(email) {
    if (await this.utilisateurRepository.emailExiste(email)) {
      throw new Error("Un utilisateur avec cet email existe déjà");
    }
  }

  /**
   * Nettoyer les données d'inscription
   * @param {Object} donnees - Données brutes
   * @returns {Object} Données nettoyées
   * @private
   */
  nettoyerDonneesInscription(donnees) {
    return {
      email: donnees.email.toLowerCase().trim(),
      mot_de_passe: donnees.mot_de_passe,
      prenom: donnees.prenom.trim(),
      nom: donnees.nom.trim(),
      telephone: donnees.telephone?.trim() || null,
      role: donnees.role || "client",
    };
  }

  /**
   * Nettoyer les données de profil
   * @param {Object} donnees - Données brutes
   * @returns {Object} Données nettoyées
   * @private
   */
  nettoyerDonneesProfil(donnees) {
    const nettoyees = {};

    if (donnees.email) {
      nettoyees.email = donnees.email.toLowerCase().trim();
    }
    if (donnees.prenom) {
      nettoyees.prenom = donnees.prenom.trim();
    }
    if (donnees.nom) {
      nettoyees.nom = donnees.nom.trim();
    }
    if (donnees.telephone !== undefined) {
      nettoyees.telephone = donnees.telephone ? donnees.telephone.trim() : null;
    }

    return nettoyees;
  }

  /**
   * Appliquer les modifications au profil
   * @param {Object} utilisateur - Instance utilisateur
   * @param {Object} donnees - Nouvelles données
   * @private
   */
  appliquerModificationsProfil(utilisateur, donnees) {
    Object.keys(donnees).forEach((cle) => {
      if (donnees[cle] !== undefined) {
        utilisateur[cle] = donnees[cle];
      }
    });
  }

  /**
   * Valider les paramètres de connexion
   * @param {string} email - Email
   * @param {string} motDePasse - Mot de passe
   * @private
   */
  validerParametresConnexion(email, motDePasse) {
    if (!email || !motDePasse) {
      throw new Error("Email et mot de passe requis");
    }
  }

  /**
   * Valider le changement de mot de passe
   * @param {string} ancienMotDePasse - Ancien mot de passe
   * @param {string} nouveauMotDePasse - Nouveau mot de passe
   * @private
   */
  validerChangementMotDePasse(ancienMotDePasse, nouveauMotDePasse) {
    if (ancienMotDePasse === nouveauMotDePasse) {
      throw new Error(
        "Le nouveau mot de passe doit être différent de l'ancien",
      );
    }
    this.validerMotDePasse(nouveauMotDePasse);
  }

  /**
   * Valider un mot de passe
   * @param {string} motDePasse - Mot de passe à valider
   * @private
   */
  validerMotDePasse(motDePasse) {
    if (!motDePasse || motDePasse.length < 6) {
      throw new Error("Le mot de passe doit contenir au moins 6 caractères");
    }
  }

  /**
   * Valider les filtres de liste
   * @param {Object} filtres - Filtres à valider
   * @returns {Object} Filtres validés
   * @private
   */
  validerFiltresListe(filtres = {}) {
    const filtresValides = {};

    if (
      filtres.role &&
      ["admin", "boutique", "client"].includes(filtres.role)
    ) {
      filtresValides.role = filtres.role;
    }
    if (filtres.actif !== undefined) {
      filtresValides.actif = filtres.actif;
    }

    return filtresValides;
  }

  /**
   * Valider la pagination
   * @param {Object} pagination - Pagination à valider
   * @returns {Object} Pagination validée
   * @private
   */
  validerPagination(pagination = {}) {
    return {
      page: Math.max(1, parseInt(pagination.page) || 1),
      limite: Math.min(100, Math.max(1, parseInt(pagination.limite) || 10)),
    };
  }

  /**
   * Valider le changement de statut
   * @param {Object} utilisateur - Utilisateur
   * @param {boolean} nouveauStatut - Nouveau statut
   * @private
   */
  validerChangementStatut(utilisateur, nouveauStatut) {
    if (typeof nouveauStatut !== "boolean") {
      throw new Error("Le statut doit être un booléen");
    }

    // Empêcher la désactivation du dernier admin
    if (!nouveauStatut && utilisateur.role === "admin") {
      // TODO: Vérifier qu'il y a d'autres admins actifs
      console.log("Attention: Désactivation d'un administrateur");
    }
  }
}

module.exports = UtilisateurService;
