const CommandeRepository = require("../../repositories/boutique/CommandeRepository");
const ProduitRepository = require("../../repositories/boutique/ProduitRepository");
const MouvementStockService = require("./MouvementStockService");

class CommandeService {
  constructor() {
    this.commandeRepository = new CommandeRepository();
    this.produitRepository = new ProduitRepository();
    this.mouvementStockService = new MouvementStockService();
  }

  _genererReference() {
    const now = new Date();
    const date =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0");
    const rand = String(Math.floor(1000 + Math.random() * 9000));
    return `CMD-${date}-${rand}`;
  }

  async creerCommande(donnees, idBoutique) {
    const { client, lignes, notes } = donnees;
    const reference = this._genererReference();

    // Enrichir chaque ligne
    const lignesEnrichies = [];
    for (const ligne of lignes) {
      const produit = await this.produitRepository.trouverParId(ligne.idProduit);
      if (!produit) throw new Error(`Produit ${ligne.idProduit} non trouvé`);

      let variante = null;
      if (ligne.idVariante) {
        variante = produit.variantes.find(
          (v) => v._id.toString() === ligne.idVariante.toString()
        );
      } else if (produit.variantes.length > 0) {
        variante = produit.variantes[0];
      }

      if (!variante) throw new Error(`Variante introuvable pour le produit "${produit.nom}"`);

      // ── Vérification stock suffisant ──
      const stockDisponible = variante.stock?.quantite ?? 0;
      if (stockDisponible < ligne.quantite) {
        const varianteLabel = [variante.couleur, variante.unite].filter(Boolean).join(" / ") || "variante par défaut";
        throw new Error(
          `Stock insuffisant pour "${produit.nom}" (${varianteLabel}). ` +
          `Disponible : ${stockDisponible}, demandé : ${ligne.quantite}.`
        );
      }

      const prixUnitaire =
        ligne.prixUnitaire !== undefined
          ? ligne.prixUnitaire
          : variante?.prix?.montant || 0;

      const sousTotal = prixUnitaire * ligne.quantite;

      lignesEnrichies.push({
        idProduit: produit._id,
        idVariante: variante?._id,
        nomProduit: produit.nom,
        couleur: variante?.couleur || "",
        unite: variante?.unite || "",
        prixUnitaire,
        quantite: ligne.quantite,
        sousTotal,
      });
    }

    const total = lignesEnrichies.reduce((sum, l) => sum + l.sousTotal, 0);

    const commande = await this.commandeRepository.creer({
      idBoutique,
      reference,
      client,
      lignes: lignesEnrichies,
      total,
      notes,
    });

    // Créer les mouvements de stock (sortie) — erreurs propagées
    for (const ligne of lignesEnrichies) {
      await this.mouvementStockService.creerMouvement({
        idBoutique,
        idProduit: ligne.idProduit,
        idVariante: ligne.idVariante,
        type: "sortie",
        quantite: ligne.quantite,
        utilisateur: idBoutique,
        motif: "vente",
        note: `Commande ${reference}`,
      });
    }

    return commande;
  }

  async modifierStatut(id, nouveauStatut, idBoutique) {
    const commande = await this.commandeRepository.trouverParId(id);
    if (!commande) throw new Error("Commande non trouvée");
    if (commande.idBoutique.toString() !== idBoutique.toString()) {
      throw new Error("Accès refusé");
    }

    const ancienStatut = commande.statut;

    // Restaurer le stock si on annule
    if (nouveauStatut === "annulee" && ancienStatut !== "annulee") {
      for (const ligne of commande.lignes) {
        try {
          await this.mouvementStockService.creerMouvement({
            idBoutique,
            idProduit: ligne.idProduit._id || ligne.idProduit,
            idVariante: ligne.idVariante,
            type: "entree",
            quantite: ligne.quantite,
            utilisateur: idBoutique,
            motif: "retour_client",
            note: `Annulation commande ${commande.reference}`,
          });
        } catch (err) {
          console.warn(`Stock non restauré pour produit ${ligne.idProduit}: ${err.message}`);
        }
      }
    }

    // Vérifier le stock si on réactive une commande annulée
    if (ancienStatut === "annulee" && nouveauStatut !== "annulee") {
      for (const ligne of commande.lignes) {
        const produit = await this.produitRepository.trouverParId(
          ligne.idProduit._id || ligne.idProduit
        );
        if (produit) {
          const variante = ligne.idVariante
            ? produit.variantes.find((v) => v._id.toString() === ligne.idVariante.toString())
            : produit.variantes[0];
          const stockDisponible = variante?.stock?.quantite ?? 0;
          if (stockDisponible < ligne.quantite) {
            const varianteLabel = [variante?.couleur, variante?.unite].filter(Boolean).join(" / ") || "variante par défaut";
            throw new Error(
              `Stock insuffisant pour réactiver "${ligne.nomProduit}" (${varianteLabel}). ` +
              `Disponible : ${stockDisponible}, requis : ${ligne.quantite}.`
            );
          }
        }
      }
      // Déduire le stock
      for (const ligne of commande.lignes) {
        try {
          await this.mouvementStockService.creerMouvement({
            idBoutique,
            idProduit: ligne.idProduit._id || ligne.idProduit,
            idVariante: ligne.idVariante,
            type: "sortie",
            quantite: ligne.quantite,
            utilisateur: idBoutique,
            motif: "vente",
            note: `Réactivation commande ${commande.reference}`,
          });
        } catch (err) {
          console.warn(`Stock non déduit pour produit ${ligne.idProduit}: ${err.message}`);
        }
      }
    }

    return await this.commandeRepository.mettreAJour(id, { statut: nouveauStatut });
  }

  async modifierCommande(id, donnees, idBoutique) {
    const commande = await this.commandeRepository.trouverParId(id);
    if (!commande) throw new Error("Commande non trouvée");
    if (commande.idBoutique.toString() !== idBoutique.toString()) {
      throw new Error("Accès refusé");
    }

    const { client, notes, statut } = donnees;
    const mise = {};
    if (client !== undefined) mise.client = client;
    if (notes !== undefined) mise.notes = notes;
    if (statut !== undefined) mise.statut = statut;

    return await this.commandeRepository.mettreAJour(id, mise);
  }

  async supprimerCommande(id, idBoutique) {
    const commande = await this.commandeRepository.trouverParId(id);
    if (!commande) throw new Error("Commande non trouvée");
    if (commande.idBoutique.toString() !== idBoutique.toString()) {
      throw new Error("Accès refusé");
    }
    if (!["en_attente", "annulee"].includes(commande.statut)) {
      throw new Error(
        "Impossible de supprimer une commande confirmée, expédiée ou livrée"
      );
    }
    return await this.commandeRepository.supprimer(id);
  }

  async listerCommandes(idBoutique, options = {}) {
    return await this.commandeRepository.trouverParBoutique(idBoutique, options);
  }

  async obtenirCommande(id, idBoutique) {
    const commande = await this.commandeRepository.trouverParId(id);
    if (!commande) throw new Error("Commande non trouvée");
    if (commande.idBoutique.toString() !== idBoutique.toString()) {
      throw new Error("Accès refusé");
    }
    return commande;
  }

  async stats(idBoutique) {
    return await this.commandeRepository.stats(idBoutique);
  }
}

module.exports = CommandeService;
