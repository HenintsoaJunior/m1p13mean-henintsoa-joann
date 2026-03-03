const Stripe = require("stripe");
const PaiementLoyer = require("../../models/boutique/PaiementLoyer");
const Boutique = require("../../models/admin/Boutique");
const EmailService = require("../EmailService");

class PaiementLoyerService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET);
    this.emailService = new EmailService();
  }

  /**
   * Crée un PaymentIntent Stripe et enregistre le paiement en base
   */
  async creerPaymentIntent(boutiqueId, montant, moisLoyer, emplacementId) {
    // Vérifier si un paiement existe déjà pour ce mois (non échoué)
    const existant = await PaiementLoyer.findOne({
      boutique_id: boutiqueId,
      mois_loyer: moisLoyer,
      statut: { $in: ["en_attente", "paye"] },
    });
    if (existant) {
      if (existant.statut === "paye") {
        throw new Error("Le loyer de ce mois est déjà payé.");
      }
      // Retourner l'intent existant en attente
      const intent = await this.stripe.paymentIntents.retrieve(
        existant.stripe_payment_intent_id,
      );
      return { clientSecret: intent.client_secret, paiement: existant };
    }

    // Créer le PaymentIntent Stripe (MGA est une devise zero-decimal, pas de centimes)
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(montant), // MGA = zero-decimal currency
      currency: "mga",
      metadata: {
        boutique_id: boutiqueId.toString(),
        mois_loyer: moisLoyer,
        emplacement_id: emplacementId ? emplacementId.toString() : "",
      },
    });

    // Enregistrer en base
    const paiement = await PaiementLoyer.create({
      boutique_id: boutiqueId,
      emplacement_id: emplacementId,
      stripe_payment_intent_id: paymentIntent.id,
      montant,
      mois_loyer: moisLoyer,
      statut: "en_attente",
    });

    return { clientSecret: paymentIntent.client_secret, paiement };
  }

  /**
   * Traite l'événement webhook Stripe
   */
  async traiterWebhook(payload, sig) {
    let event;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (webhookSecret && webhookSecret !== "whsec_your_webhook_secret_here") {
      event = this.stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } else {
      // Mode développement sans secret webhook configuré
      event = JSON.parse(payload);
    }

    if (event.type === "payment_intent.succeeded") {
      await this.confirmerPaiement(event.data.object);
    } else if (event.type === "payment_intent.payment_failed") {
      await this.echouerPaiement(event.data.object.id);
    }

    return event;
  }

  /**
   * Confirme un paiement et envoie la facture PDF
   */
  async confirmerPaiement(paymentIntentObj) {
    const paiement = await PaiementLoyer.findOneAndUpdate(
      { stripe_payment_intent_id: paymentIntentObj.id },
      { statut: "paye", date_paiement: new Date() },
      { new: true },
    ).populate({
      path: "boutique_id",
      populate: {
        path: "appel_offre_id",
        populate: { path: "emplacement_id" },
      },
    });

    if (!paiement) return;

    // Envoyer facture PDF par email
    if (!paiement.facture_envoyee) {
      try {
        const pdfBuffer = await this.genererFacturePDF(paiement);
        const boutique = paiement.boutique_id;
        const email = boutique?.contact?.email;

        if (email) {
          await this.emailService.envoyerFactureLoyer(
            email,
            boutique,
            paiement,
            pdfBuffer,
          );
          paiement.facture_envoyee = true;
          await paiement.save();
        }
      } catch (err) {
        console.error("Erreur envoi facture:", err.message);
      }
    }

    return paiement;
  }

  /**
   * Marque un paiement comme échoué
   */
  async echouerPaiement(paymentIntentId) {
    await PaiementLoyer.findOneAndUpdate(
      { stripe_payment_intent_id: paymentIntentId },
      { statut: "echoue" },
    );
  }

  /**
   * Récupère l'historique des paiements d'une boutique
   */
  async getHistoriqueBoutique(boutiqueId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [paiements, total] = await Promise.all([
      PaiementLoyer.find({ boutique_id: boutiqueId })
        .sort({ cree_le: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PaiementLoyer.countDocuments({ boutique_id: boutiqueId }),
    ]);
    return { paiements, total, page, pages: Math.ceil(total / limit) };
  }

  /**
   * Récupère tous les paiements pour l'admin
   */
  async getTousPaiements(filtres = {}, page = 1, limit = 20) {
    const query = {};
    if (filtres.statut) query.statut = filtres.statut;
    if (filtres.boutique_id) query.boutique_id = filtres.boutique_id;
    if (filtres.mois_loyer) query.mois_loyer = filtres.mois_loyer;

    const skip = (page - 1) * limit;
    const [paiements, total] = await Promise.all([
      PaiementLoyer.find(query)
        .populate("boutique_id", "contact statut")
        .populate("emplacement_id", "nom code loyer_mensuel")
        .sort({ cree_le: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PaiementLoyer.countDocuments(query),
    ]);
    return { paiements, total, page, pages: Math.ceil(total / limit) };
  }

  /**
   * Génère un PDF de facture
   */
  async genererFacturePDF(paiement) {
    return new Promise((resolve, reject) => {
      const PDFDocument = require("pdfkit");
      const chunks = [];
      const doc = new PDFDocument({ margin: 50 });

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const boutique = paiement.boutique_id;
      const nomBoutique = boutique?.contact?.nom || "Boutique";
      const moisLabel = this.formatMois(paiement.mois_loyer);

      // En-tête
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("FACTURE DE LOYER", { align: "center" });
      doc.moveDown();
      doc
        .fontSize(12)
        .font("Helvetica")
        .text(`Facture N° : ${paiement._id}`, { align: "right" });
      doc.text(`Date : ${new Date().toLocaleDateString("fr-FR")}`, {
        align: "right",
      });
      doc.moveDown(2);

      // Informations boutique
      doc.font("Helvetica-Bold").text("Destinataire :");
      doc.font("Helvetica").text(nomBoutique);
      if (boutique?.contact?.email) doc.text(boutique.contact.email);
      if (boutique?.contact?.adresse) doc.text(boutique.contact.adresse);
      doc.moveDown(2);

      // Détails paiement
      doc
        .font("Helvetica-Bold")
        .text("Détails du paiement :", { underline: true });
      doc.moveDown(0.5);

      const tableTop = doc.y;
      doc.font("Helvetica-Bold");
      doc.text("Description", 50, tableTop);
      doc.text("Période", 300, tableTop);
      doc.text("Montant", 450, tableTop);

      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();
      doc.font("Helvetica");
      const rowY = tableTop + 25;
      doc.text("Loyer emplacement", 50, rowY);
      doc.text(moisLabel, 300, rowY);
      doc.text(`${paiement.montant.toLocaleString("fr-FR")} Ar`, 450, rowY);

      doc
        .moveTo(50, rowY + 20)
        .lineTo(550, rowY + 20)
        .stroke();
      doc.font("Helvetica-Bold");
      doc.text("TOTAL", 300, rowY + 30);
      doc.text(`${paiement.montant.toLocaleString("fr-FR")} Ar`, 450, rowY + 30);
      doc.moveDown(4);

      // Statut
      doc
        .font("Helvetica-Bold")
        .fillColor("green")
        .text(
          `✓ PAYÉ - ${new Date(paiement.date_paiement).toLocaleDateString("fr-FR")}`,
        );
      doc.fillColor("black");
      doc.moveDown();
      doc
        .font("Helvetica")
        .fontSize(10)
        .text(`Référence Stripe : ${paiement.stripe_payment_intent_id}`);

      doc.end();
    });
  }

  formatMois(moisLoyer) {
    const [year, month] = moisLoyer.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  }
}

module.exports = PaiementLoyerService;
