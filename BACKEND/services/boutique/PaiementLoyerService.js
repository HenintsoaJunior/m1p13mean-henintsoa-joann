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
      const doc = new PDFDocument({ margin: 0, size: "A4" });

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const boutique = paiement.boutique_id;
      const nomBoutique = boutique?.contact?.nom || "Boutique";
      const emailBoutique = boutique?.contact?.email || "";
      const telephoneBoutique = boutique?.contact?.telephone || "";
      const adresseBoutique = boutique?.contact?.adresse || "";

      // Formatage des données
      const [annee, moisNum] = paiement.mois_loyer.split("-");
      const moisNoms = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
      const moisLabel = `${moisNoms[parseInt(moisNum) - 1]} ${annee}`;
      const datePaiement = new Date(paiement.date_paiement);
      const dateFr = `${String(datePaiement.getDate()).padStart(2,"0")} ${moisNoms[datePaiement.getMonth()]} ${datePaiement.getFullYear()}`;
      const dateEmission = new Date();
      const dateEmissionFr = `${String(dateEmission.getDate()).padStart(2,"0")} ${moisNoms[dateEmission.getMonth()]} ${dateEmission.getFullYear()}`;
      const factureNum = `FAC-${paiement._id.toString().slice(-8).toUpperCase()}`;
      // Montant MGA : séparateur milliers par espace → "150 000 Ar"
      const montantNum = Math.round(paiement.montant);
      const montantStr = montantNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f");
      const montantFormate = `${montantStr} Ar`;

      const W = 595;
      const BLUE = "#3660a9";
      const DARK = "#1e3a5f";
      const GRAY = "#6b7280";
      const LIGHT = "#f8fafc";
      const BORDER = "#e5e7eb";

      // ══ EN-TÊTE BLEU ══
      doc.rect(0, 0, W, 110).fill(BLUE);
      doc.rect(0, 105, W, 5).fill(DARK);
      doc.fillColor("white").font("Helvetica-Bold").fontSize(26)
        .text("FACTURE DE LOYER", 50, 22, { width: 340 });
      doc.font("Helvetica").fontSize(11).fillColor("rgba(255,255,255,0.80)")
        .text("Paiement d'emplacement · Centre Commercial", 50, 58);
      doc.font("Helvetica-Bold").fontSize(11).fillColor("white")
        .text(factureNum, 390, 22, { width: 160, align: "right" });
      doc.font("Helvetica").fontSize(9).fillColor("rgba(255,255,255,0.70)")
        .text(`Emise le ${dateEmissionFr}`, 390, 42, { width: 160, align: "right" })
        .text(`Periode : ${moisLabel}`, 390, 58, { width: 160, align: "right" });

      // ══ DESTINATAIRE ══
      const infoY = 130;
      doc.roundedRect(50, infoY, 230, 120, 8).fillAndStroke("#ffffff", BORDER);
      doc.font("Helvetica-Bold").fontSize(8).fillColor(GRAY)
        .text("DESTINATAIRE", 66, infoY + 14);
      doc.moveTo(66, infoY + 26).lineTo(268, infoY + 26).lineWidth(0.5).stroke(BORDER);
      doc.font("Helvetica-Bold").fontSize(13).fillColor("#111827")
        .text(nomBoutique, 66, infoY + 34, { width: 200 });
      doc.font("Helvetica").fontSize(9).fillColor("#374151");
      let cy = infoY + 54;
      if (emailBoutique)     { doc.text(emailBoutique, 66, cy); cy += 15; }
      if (telephoneBoutique) { doc.text(telephoneBoutique, 66, cy); cy += 15; }
      if (adresseBoutique)   { doc.text(adresseBoutique, 66, cy, { width: 200 }); }

      // ══ STATUT PAYÉ ══
      doc.roundedRect(315, infoY, 230, 120, 8).fillAndStroke("#f0fdf4", "#86efac");
      doc.font("Helvetica-Bold").fontSize(8).fillColor(GRAY)
        .text("STATUT DU PAIEMENT", 331, infoY + 14);
      doc.moveTo(331, infoY + 26).lineTo(533, infoY + 26).lineWidth(0.5).stroke("#86efac");
      // Badge vert
      doc.roundedRect(331, infoY + 34, 80, 26, 13).fill("#16a34a");
      doc.font("Helvetica-Bold").fontSize(11).fillColor("white")
        .text("\u2713 PAYE", 331, infoY + 40, { width: 80, align: "center" });
      doc.font("Helvetica").fontSize(10).fillColor("#374151")
        .text(`Date : ${dateFr}`, 331, infoY + 70);
      doc.fontSize(9).fillColor(GRAY)
        .text("Confirme via Stripe", 331, infoY + 88);

      // ══ TABLEAU ══
      const tY = infoY + 140;
      doc.rect(50, tY, W - 100, 28).fill(DARK);
      doc.font("Helvetica-Bold").fontSize(9).fillColor("white")
        .text("DESCRIPTION", 66, tY + 10)
        .text("PERIODE", 285, tY + 10)
        .text("MONTANT", 420, tY + 10, { width: 120, align: "right" });

      // Ligne données
      doc.rect(50, tY + 28, W - 100, 42).fill(LIGHT);
      doc.font("Helvetica").fontSize(11).fillColor("#111827")
        .text("Loyer emplacement", 66, tY + 39)
        .text(moisLabel, 285, tY + 39);
      doc.font("Helvetica-Bold").fontSize(11).fillColor(BLUE)
        .text(montantFormate, 420, tY + 39, { width: 120, align: "right" });

      // Ligne total
      doc.rect(50, tY + 70, W - 100, 46).fill(DARK);
      doc.font("Helvetica-Bold").fontSize(12).fillColor("white")
        .text("TOTAL A PAYER", 285, tY + 83);
      doc.font("Helvetica-Bold").fontSize(17).fillColor("#fbbf24")
        .text(montantFormate, 370, tY + 80, { width: 170, align: "right" });

      // ══ RÉFÉRENCE STRIPE ══
      const refY = tY + 136;
      doc.roundedRect(50, refY, W - 100, 40, 6).fillAndStroke(LIGHT, BORDER);
      doc.font("Helvetica-Bold").fontSize(8).fillColor(GRAY)
        .text("REFERENCE STRIPE", 66, refY + 8);
      doc.font("Helvetica").fontSize(8.5).fillColor("#374151")
        .text(paiement.stripe_payment_intent_id || "—", 66, refY + 22, { width: W - 132 });

      // ══ NOTE ══
      const noteY = refY + 58;
      doc.roundedRect(50, noteY, W - 100, 46, 6).fillAndStroke("#fffbeb", "#fde68a");
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#92400e").text("Note :", 66, noteY + 10);
      doc.font("Helvetica").fontSize(9).fillColor("#78350f")
        .text("Ce paiement a ete confirme et enregistre. Conservez ce document comme justificatif officiel de paiement de loyer.", 66, noteY + 24, { width: W - 132 });

      // ══ PIED DE PAGE ══
      doc.rect(0, 782, W, 60).fill(LIGHT);
      doc.moveTo(0, 782).lineTo(W, 782).lineWidth(0.5).stroke(BORDER);
      doc.font("Helvetica").fontSize(8).fillColor(GRAY)
        .text("Document genere automatiquement — Centre Commercial · Paiement securise SSL 256-bit via Stripe", 50, 796, { align: "center", width: W - 100 });
      doc.font("Helvetica-Bold").fontSize(8).fillColor(BLUE)
        .text(`Facture N\u00b0 ${factureNum}`, 50, 812, { align: "center", width: W - 100 });

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
