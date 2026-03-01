const reponseRepo = require("../../repositories/admin/ReponseAppelOffreRepository");
const AppelOffre = require("../../models/admin/AppelOffre");
const Emplacement = require("../../models/admin/Emplacement");

class ReponseService {
  async createReponse(data) {
    const { appel_offre_id, montant_propose, email_proposeur } = data;

    // validation minimale
    if (!montant_propose || isNaN(montant_propose)) {
      throw new Error("Montant proposé invalide");
    }
    if (!email_proposeur || !/^\S+@\S+\.\S+$/.test(email_proposeur)) {
      throw new Error("Email du proposeur invalide");
    }

    const appel = await AppelOffre.findById(appel_offre_id);
    if (!appel) throw new Error("Appel d'offre introuvable");
    if (appel.statut !== "ouvert") throw new Error("Appel d'offre non ouvert à la réponse");

    const reponse = await reponseRepo.create(data);
    return { message: "Réponse créée", reponse };
  }

  async getReponsesByAppel(appelId, options = {}) {
    return await reponseRepo.findByAppelOffre(appelId, options);
  }

  async acceptReponse(reponseId) {
    const reponse = await reponseRepo.findById(reponseId);
    if (!reponse) throw new Error("Réponse introuvable");
    if (reponse.statut === "accepte") throw new Error("Réponse déjà acceptée");

    // Mettre à jour la réponse
    const updated = await reponseRepo.update(reponseId, { statut: "accepte", modifie_le: new Date() });

    // Mettre à jour l'appel d'offre
    await AppelOffre.findByIdAndUpdate(reponse.appel_offre_id, { statut: "attribue" });

    // Mettre à jour l'emplacement
    const appel = await AppelOffre.findById(reponse.appel_offre_id);
    if (appel && appel.emplacement_id) {
      await Emplacement.findByIdAndUpdate(appel.emplacement_id, { statut: "occupe" });
    }

    // Refuser les autres réponses
    await reponseRepo.updateMany({ appel_offre_id: reponse.appel_offre_id, _id: { $ne: reponseId } }, { statut: "refuse" });

    // création automatique d'une fiche Boutique et d'un compte Utilisateur (boutique), puis envoi des identifiants
    if (reponse.email_proposeur) {
      const Utilisateur = require("../../models/Utilisateur");
      const BoutiqueModel = require("../../models/admin/Boutique");
      const crypto = require("crypto");
      const EmailService = require("../../services/EmailService");
      const emailService = new EmailService();

      // Générer une adresse email système pour le compte boutique
      const domain = process.env.BOUTIQUE_EMAIL_DOMAIN || 'example.com';
      const randomHex = crypto.randomBytes(6).toString('hex');
      const accountEmail = `boutique-${randomHex}@${domain}`;

      // créer la fiche Boutique si elle n'existe pas pour cet appel
      try {
        const existingBout = await BoutiqueModel.findOne({ appel_offre_id: reponse.appel_offre_id, 'contact.email': accountEmail });
        if (!existingBout) {
          await BoutiqueModel.create({
            appel_offre_id: reponse.appel_offre_id,
            contact: {
              nom: 'Propriétaire',
              prenom: 'Boutique',
              email: accountEmail,
            },
            statut: 'en_attente',
          });
        }
      } catch (err) {
        console.error('Erreur création Boutique:', err.message || err);
      }

      // créer le compte utilisateur boutique s'il n'existe pas
      const existingUser = await Utilisateur.findOne({ email: accountEmail });
      if (!existingUser) {
        // génération d'un mot de passe sécurisé
        const raw = crypto.randomBytes(12).toString('base64');
        const cleaned = raw.replace(/[^A-Za-z0-9]/g, '');
        const securePass = (cleaned + 'A1!@').slice(0, 12);

        const nouvelUtilisateur = await Utilisateur.create({
          email: accountEmail,
          mot_de_passe: securePass,
          prenom: 'Boutique',
          nom: 'Propriétaire',
          role: 'boutique',
          actif: true,
        });

        // afficher les identifiants dans la console
        console.log('=== Identifiants boutique créés automatiquement ===');
        console.log(`Email: ${nouvelUtilisateur.email}`);
        console.log(`Mot de passe temporaire: ${securePass}`);
        console.log('=================================================');

        // envoyer les identifiants par email au proposeur
        try {
          await emailService.envoyerIdentifiants(nouvelUtilisateur, securePass, reponse.email_proposeur);
        } catch (err) {
          console.error('Erreur lors de l\'envoi des identifiants par email:', err.message || err);
        }
      } else {
        // si l'utilisateur existe déjà, informer le proposeur que le compte existe
        console.log('=== Compte boutique déjà existant ===');
        console.log(`Email: ${existingUser.email}`);
        console.log('=====================================');

        const template = `
          <h1>Compte boutique existant</h1>
          <p>Bonjour,</p>
          <p>Un compte boutique a déjà été créé pour cet appel d'offre avec l'adresse <strong>${existingUser.email}</strong>.</p>
          <p>Si vous êtes le propriétaire et que vous ne connaissez pas le mot de passe, utilisez la fonctionnalité de réinitialisation de mot de passe.</p>
        `;

        try {
          await emailService.envoyerEmail(reponse.email_proposeur, 'Compte boutique existant', template);
        } catch (err) {
          console.error('Erreur lors de l\'envoi de la notification de compte existant:', err.message || err);
        }
      }
    }

    return { message: "Réponse acceptée", reponse: updated };
  }

  async refuseReponse(reponseId) {
    const reponse = await reponseRepo.findById(reponseId);
    if (!reponse) throw new Error("Réponse introuvable");
    if (reponse.statut === "refuse") throw new Error("Réponse déjà refusée");

    const updated = await reponseRepo.update(reponseId, { statut: "refuse", modifie_le: new Date() });
    return { message: "Réponse refusée", reponse: updated };
  }
}

module.exports = new ReponseService();
