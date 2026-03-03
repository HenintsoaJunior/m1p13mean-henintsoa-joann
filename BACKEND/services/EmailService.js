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
      await this.envoyerEmail(utilisateur.email, "Bienvenue !", template);
    } catch (err) {
      console.error("Erreur envoi bienvenue:", err);
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
      await this.envoyerEmail(
        destinataire,
        "Vos identifiants boutique",
        template,
      );
    } catch (err) {
      console.error("Erreur envoi identifiants:", err);
    }
  }

  /**
   * Envoyer un token de réinitialisation
   * @param {Object} utilisateur - Utilisateur
   * @param {string} token - Token de réinitialisation
   * @returns {Promise<void>}
   */
  async envoyerTokenReinitialisation(utilisateur, token) {
    console.log(
      `🔐 Token de réinitialisation envoyé à ${utilisateur.email}: ${token}`,
    );
    const template = this.genererTemplateReinitialisation(utilisateur, token);
    try {
      await this.envoyerEmail(
        utilisateur.email,
        "Réinitialisation de mot de passe",
        template,
      );
    } catch (err) {
      console.error("Erreur envoi token reset:", err);
    }
  }

  async confirmerReinitialisationMotDePasse(utilisateur) {
    console.log(
      `✅ Confirmation réinitialisation envoyée à ${utilisateur.email}`,
    );
    const template = this.genererTemplateConfirmationReset(utilisateur);
    try {
      await this.envoyerEmail(
        utilisateur.email,
        "Mot de passe réinitialisé",
        template,
      );
    } catch (err) {
      console.error("Erreur envoi confirmation reset:", err);
    }
  }

  /**
   * Envoyer la facture de loyer par email avec le PDF en pièce jointe
   */
  async envoyerFactureLoyer(destinataire, boutique, paiement, pdfBuffer) {
    const nomBoutique = boutique?.contact?.nom || "Boutique";
    const moisLabel = this.formatMoisLabel(paiement.mois_loyer);
    const montantFormate = new Intl.NumberFormat("fr-FR").format(paiement.montant) + " Ar";
    const datePaiement = new Date(paiement.date_paiement).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "long", year: "numeric"
    });
    const factureNum = `FAC-${paiement._id.toString().slice(-8).toUpperCase()}`;
    const sujet = `✅ Facture de loyer confirmée — ${moisLabel}`;

    const contenu = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- En-tête bleu -->
        <tr>
          <td style="background:#3660a9;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
              ✓ Paiement de loyer confirmé
            </h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
              Centre Commercial · Facture N° ${factureNum}
            </p>
          </td>
        </tr>

        <!-- Corps -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 20px;font-size:15px;color:#374151;">
              Bonjour <strong>${nomBoutique}</strong>,
            </p>
            <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.6;">
              Nous vous confirmons la bonne réception de votre paiement de loyer pour le mois de
              <strong style="color:#111827;">${moisLabel}</strong>.
              Votre facture est disponible en pièce jointe.
            </p>

            <!-- Récapitulatif -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:28px;">
              <tr style="background:#3660a9;">
                <td colspan="2" style="padding:12px 20px;">
                  <span style="color:white;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Détails du paiement</span>
                </td>
              </tr>
              <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="padding:14px 20px;font-size:13px;color:#6b7280;font-weight:600;">N° Facture</td>
                <td style="padding:14px 20px;font-size:13px;color:#111827;font-weight:700;text-align:right;">${factureNum}</td>
              </tr>
              <tr style="background:#fff;border-bottom:1px solid #e5e7eb;">
                <td style="padding:14px 20px;font-size:13px;color:#6b7280;font-weight:600;">Période</td>
                <td style="padding:14px 20px;font-size:13px;color:#111827;font-weight:700;text-align:right;">${moisLabel}</td>
              </tr>
              <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="padding:14px 20px;font-size:13px;color:#6b7280;font-weight:600;">Date de paiement</td>
                <td style="padding:14px 20px;font-size:13px;color:#111827;font-weight:700;text-align:right;">${datePaiement}</td>
              </tr>
              <tr style="background:#fff;border-bottom:1px solid #e5e7eb;">
                <td style="padding:14px 20px;font-size:13px;color:#6b7280;font-weight:600;">Référence Stripe</td>
                <td style="padding:14px 20px;font-size:11px;color:#6b7280;font-family:monospace;text-align:right;">${paiement.stripe_payment_intent_id}</td>
              </tr>
              <tr style="background:#f0fdf4;">
                <td style="padding:16px 20px;font-size:14px;color:#065f46;font-weight:700;">TOTAL PAYÉ</td>
                <td style="padding:16px 20px;font-size:18px;color:#065f46;font-weight:800;text-align:right;">${montantFormate}</td>
              </tr>
            </table>

            <!-- Note pièce jointe -->
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px 18px;margin-bottom:28px;display:flex;align-items:center;">
              <span style="font-size:13px;color:#1e40af;">
                📎 <strong>Votre facture PDF</strong> est disponible en pièce jointe de cet email.
              </span>
            </div>

            <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
              Cordialement,<br>
              <strong style="color:#374151;">L'équipe du Centre Commercial</strong>
            </p>
          </td>
        </tr>

        <!-- Pied de page -->
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">
              Ce message est généré automatiquement — merci de ne pas y répondre.<br>
              Paiement sécurisé via <strong>Stripe</strong> · Chiffrement SSL 256-bit
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    try {
      const nodemailer = require("nodemailer");
      const host = process.env.SMTP_HOST;
      if (!host) {
        console.warn("SMTP non configuré — facture simulée pour:", destinataire);
        return;
      }
      const port = parseInt(process.env.SMTP_PORT || "587", 10);
      const secure = process.env.SMTP_SECURE === "true";
      const user = process.env.SMTP_USER || undefined;
      const pass = process.env.SMTP_PASS || undefined;
      const from = process.env.EMAIL_FROM || "no-reply@example.com";
      const transporterOptions = { host, port, secure };
      if (user) transporterOptions.auth = { user, pass };
      const transporter = nodemailer.createTransport(transporterOptions);
      await transporter.sendMail({
        from,
        to: destinataire,
        subject: sujet,
        html: contenu,
        attachments: [{
          filename: `facture-loyer-${paiement.mois_loyer}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        }],
      });
      console.log(`Facture loyer envoyée à ${destinataire}`);
    } catch (err) {
      console.error("Erreur envoi facture loyer:", err);
      throw err;
    }
  }

  formatMoisLabel(moisLoyer) {
    const [year, month] = moisLoyer.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  }

  async notifierChangementMotDePasse(utilisateur) {
    console.log(
      `🔔 Notification changement mot de passe à ${utilisateur.email}`,
    );
    const template = this.genererTemplateNotificationChangement(utilisateur);
    try {
      await this.envoyerEmail(
        utilisateur.email,
        "Mot de passe modifié",
        template,
      );
    } catch (err) {
      console.error("Erreur envoi notification changement:", err);
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
      <p>Bonjour ${utilisateur.prenom || "Utilisateur"},</p>
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
      const nodemailer = require("nodemailer");
      const host = process.env.SMTP_HOST;
      if (!host) {
        console.warn("SMTP non configuré — email simulé. Contenu:", {
          destinataire,
          sujet,
        });
        console.log("--- Email HTML ---");
        console.log(contenu);
        console.log("------------------");
        return;
      }

      const port = parseInt(process.env.SMTP_PORT || "587", 10);
      const secure = process.env.SMTP_SECURE === "true";
      const user = process.env.SMTP_USER || undefined;
      const pass = process.env.SMTP_PASS || undefined;
      const from =
        process.env.EMAIL_FROM ||
        `no-reply@${process.env.BOUTIQUE_EMAIL_DOMAIN || "example.com"}`;

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
      console.error("Erreur lors de lEnvoi d'email:", err);
      throw err;
    }
  }
}

module.exports = EmailService;
