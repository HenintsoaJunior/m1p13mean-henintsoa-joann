class EmailService {
  /**
   * Service pour la gestion des emails
   * Abstraction pour l'envoi d'emails
   */

  /**
   * Envoyer un email de bienvenue
   * @param {Object} utilisateur - Utilisateur
   * @returns {Promise<void>}
   */
  async envoyerBienvenue(utilisateur) {
    // TODO: Intégrer avec un service d'email (SendGrid, Mailgun, etc.)
    console.log(`📧 Email de bienvenue envoyé à ${utilisateur.email}`);
    
    const template = this.genererTemplateBienvenue(utilisateur);
    // await this.envoyerEmail(utilisateur.email, 'Bienvenue !', template);
  }

  /**
   * Envoyer un token de réinitialisation
   * @param {Object} utilisateur - Utilisateur
   * @param {string} token - Token de réinitialisation
   * @returns {Promise<void>}
   */
  async envoyerTokenReinitialisation(utilisateur, token) {
    console.log(`🔐 Token de réinitialisation envoyé à ${utilisateur.email}: ${token}`);
    
    const template = this.genererTemplateReinitialisation(utilisateur, token);
    // await this.envoyerEmail(utilisateur.email, 'Réinitialisation de mot de passe', template);
  }

  /**
   * Confirmer la réinitialisation du mot de passe
   * @param {Object} utilisateur - Utilisateur
   * @returns {Promise<void>}
   */
  async confirmerReinitialisationMotDePasse(utilisateur) {
    console.log(`✅ Confirmation réinitialisation envoyée à ${utilisateur.email}`);
    
    const template = this.genererTemplateConfirmationReset(utilisateur);
    // await this.envoyerEmail(utilisateur.email, 'Mot de passe réinitialisé', template);
  }

  /**
   * Notifier un changement de mot de passe
   * @param {Object} utilisateur - Utilisateur
   * @returns {Promise<void>}
   */
  async notifierChangementMotDePasse(utilisateur) {
    console.log(`🔔 Notification changement mot de passe à ${utilisateur.email}`);
    
    const template = this.genererTemplateNotificationChangement(utilisateur);
    // await this.envoyerEmail(utilisateur.email, 'Mot de passe modifié', template);
  }

  // ========== MÉTHODES PRIVÉES DE GÉNÉRATION DE TEMPLATES ==========

  /**
   * Générer le template d'email de bienvenue
   * @param {Object} utilisateur - Utilisateur
   * @returns {string} Template HTML
   * @private
   */
  genererTemplateBienvenue(utilisateur) {
    return `
      <h1>Bienvenue ${utilisateur.prenom} !</h1>
      <p>Votre compte a été créé avec succès.</p>
      <p>Email: ${utilisateur.email}</p>
      <p>Rôle: ${utilisateur.role}</p>
    `;
  }

  /**
   * Générer le template de réinitialisation
   * @param {Object} utilisateur - Utilisateur
   * @param {string} token - Token
   * @returns {string} Template HTML
   * @private
   */
  genererTemplateReinitialisation(utilisateur, token) {
    return `
      <h1>Réinitialisation de votre mot de passe</h1>
      <p>Bonjour ${utilisateur.prenom},</p>
      <p>Votre token de réinitialisation: <strong>${token}</strong></p>
      <p>Ce token expire dans 10 minutes.</p>
    `;
  }

  /**
   * Générer le template de confirmation de reset
   * @param {Object} utilisateur - Utilisateur
   * @returns {string} Template HTML
   * @private
   */
  genererTemplateConfirmationReset(utilisateur) {
    return `
      <h1>Mot de passe réinitialisé</h1>
      <p>Bonjour ${utilisateur.prenom},</p>
      <p>Votre mot de passe a été réinitialisé avec succès.</p>
      <p>Si ce n'était pas vous, contactez-nous immédiatement.</p>
    `;
  }

  /**
   * Générer le template de notification de changement
   * @param {Object} utilisateur - Utilisateur
   * @returns {string} Template HTML
   * @private
   */
  genererTemplateNotificationChangement(utilisateur) {
    return `
      <h1>Mot de passe modifié</h1>
      <p>Bonjour ${utilisateur.prenom},</p>
      <p>Votre mot de passe a été modifié le ${new Date().toLocaleString()}.</p>
      <p>Si ce n'était pas vous, contactez-nous immédiatement.</p>
    `;
  }

  /**
   * Envoyer un email (à implémenter avec un vrai service)
   * @param {string} destinataire - Email du destinataire
   * @param {string} sujet - Sujet de l'email
   * @param {string} contenu - Contenu HTML
   * @returns {Promise<void>}
   * @private
   */
  async envoyerEmail(destinataire, sujet, contenu) {
    // TODO: Intégrer avec SendGrid, Mailgun, ou autre service
    console.log(`Email envoyé: ${destinataire} - ${sujet}`);
  }
}

module.exports = EmailService;