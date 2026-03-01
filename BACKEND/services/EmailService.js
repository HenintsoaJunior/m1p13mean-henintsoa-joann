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
    console.log(`📧 Email de bienvenue envoyé à ${utilisateur.email}`);
    const template = this.genererTemplateBienvenue(utilisateur);
    try {
      await this.envoyerEmail(utilisateur.email, 'Bienvenue !', template);
    } catch (err) {
      console.error('Erreur envoi bienvenue:', err);
    }
  }

  /**
   * Envoyer les identifiants (email + mot de passe) à un nouvel utilisateur
   * @param {Object} utilisateur
   * @param {string} motDePasse
   * @param {string} [destinataireOverride] - si fourni, envoie à cet email au lieu de `utilisateur.email`
   */
  async envoyerIdentifiants(utilisateur, motDePasse, destinataireOverride) {
    const destinataire = destinataireOverride || utilisateur.email;
    console.log(`📧 Envoi identifiants à ${destinataire}`);
    const template = this.genererTemplateIdentifiants(utilisateur, motDePasse);
    try {
      await this.envoyerEmail(destinataire, 'Vos identifiants boutique', template);
    } catch (err) {
      console.error('Erreur envoi identifiants:', err);
    }
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
    try {
      await this.envoyerEmail(utilisateur.email, 'Réinitialisation de mot de passe', template);
    } catch (err) {
      console.error('Erreur envoi token reset:', err);
    }
  }

  async confirmerReinitialisationMotDePasse(utilisateur) {
    console.log(`✅ Confirmation réinitialisation envoyée à ${utilisateur.email}`);
    const template = this.genererTemplateConfirmationReset(utilisateur);
    try {
      await this.envoyerEmail(utilisateur.email, 'Mot de passe réinitialisé', template);
    } catch (err) {
      console.error('Erreur envoi confirmation reset:', err);
    }
  }

  async notifierChangementMotDePasse(utilisateur) {
    console.log(`🔔 Notification changement mot de passe à ${utilisateur.email}`);
    const template = this.genererTemplateNotificationChangement(utilisateur);
    try {
      await this.envoyerEmail(utilisateur.email, 'Mot de passe modifié', template);
    } catch (err) {
      console.error('Erreur envoi notification changement:', err);
    }
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
   * Template pour l'envoi des identifiants
   */
  genererTemplateIdentifiants(utilisateur, motDePasse) {
    return `
      <h1>Votre compte boutique</h1>
      <p>Bonjour ${utilisateur.prenom || 'Utilisateur'},</p>
      <p>Votre compte boutique a été créé automatiquement suite à votre réponse à l'appel d'offre.</p>
      <p><strong>Email:</strong> ${utilisateur.email}</p>
      <p><strong>Mot de passe temporaire:</strong> ${motDePasse}</p>
      <p>Veuillez vous connecter et modifier votre mot de passe dès la première connexion.</p>
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
   * Envoyer un email via SMTP en se basant sur les variables d'environnement
   * Variables supportées: SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, EMAIL_FROM
   * Si SMTP_HOST n'est pas configuré, on simule l'envoi en loggant le contenu.
   * @param {string} destinataire - Email du destinataire
   * @param {string} sujet - Sujet de l'email
   * @param {string} contenu - Contenu HTML
   * @returns {Promise<void>}
   * @private
   */
  async envoyerEmail(destinataire, sujet, contenu) {
    try {
      const nodemailer = require('nodemailer');
      const host = process.env.SMTP_HOST;
      if (!host) {
        console.warn('SMTP non configuré — email simulé. Contenu:', { destinataire, sujet });
        console.log('--- Email HTML ---');
        console.log(contenu);
        console.log('------------------');
        return;
      }

      const port = parseInt(process.env.SMTP_PORT || '587', 10);
      const secure = (process.env.SMTP_SECURE === 'true');
      const user = process.env.SMTP_USER || undefined;
      const pass = process.env.SMTP_PASS || undefined;
      const from = process.env.EMAIL_FROM || `no-reply@${process.env.BOUTIQUE_EMAIL_DOMAIN || 'example.com'}`;

      const transporterOptions = { host, port, secure };
      if (user) transporterOptions.auth = { user, pass };

      const transporter = nodemailer.createTransport(transporterOptions);

      await transporter.sendMail({
        from,
        to: destinataire,
        subject: sujet,
        html: contenu,
      });

      console.log(`Email envoyé: ${destinataire} - ${sujet}`);
    } catch (err) {
      console.error('Erreur lors de lEnvoi d\'email:', err);
      throw err;
    }
  }
}


module.exports = EmailService;