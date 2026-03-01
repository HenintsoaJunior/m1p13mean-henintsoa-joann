const MouvementStockRepository = require("../../repositories/boutique/MouvementStockRepository");
const ProduitRepository = require("../../repositories/boutique/ProduitRepository");

class MouvementStockService {
  constructor() {
    this.mouvementRepository = new MouvementStockRepository();
    this.produitRepository = new ProduitRepository();
  }

  /**
   * Créer un mouvement de stock et mettre à jour la quantité de la variante
   */
  async creerMouvement(donnees) {
    const { idProduit, idBoutique, idVariante, type, quantite, motif, note, utilisateur } = donnees;

    if (!["entree", "sortie"].includes(type)) {
      throw new Error("Type de mouvement invalide. Utilisez 'entree' ou 'sortie'.");
    }
    if (!quantite || quantite < 1) {
      throw new Error("La quantité doit être au moins 1.");
    }

    // Récupérer le produit
    const produit = await this.produitRepository.trouverParId(idProduit);
    if (!produit) throw new Error("Produit non trouvé");
    const _boutiqueId = produit.idBoutique ? (produit.idBoutique._id || produit.idBoutique).toString() : null;
    if (_boutiqueId && _boutiqueId !== idBoutique.toString()) {
      throw new Error("Ce produit n'appartient pas à votre boutique");
    }

    // Trouver la variante
    let indexVariante = -1;
    let stockAvant = 0;

    if (idVariante) {
      indexVariante = produit.variantes.findIndex(
        (v) => v._id.toString() === idVariante.toString()
      );
      if (indexVariante === -1) throw new Error("Variante non trouvée");
      stockAvant = produit.variantes[indexVariante].stock.quantite;
    } else if (produit.variantes.length > 0) {
      indexVariante = 0;
      stockAvant = produit.variantes[0].stock.quantite;
    } else {
      throw new Error("Ce produit n'a pas de variante");
    }

    // Calculer le nouveau stock
    let stockApres;
    if (type === "entree") {
      stockApres = stockAvant + parseInt(quantite);
    } else {
      stockApres = stockAvant - parseInt(quantite);
      if (stockApres < 0) {
        throw new Error(
          `Stock insuffisant. Stock actuel : ${stockAvant}, sortie demandée : ${quantite}`
        );
      }
    }

    // Mettre à jour le stock de la variante
    await this.produitRepository.mettreAJourStockVariante(idProduit, indexVariante, stockApres);

    // Mettre à jour le statut du produit si rupture
    const totalStock = produit.variantes.reduce((sum, v, i) => {
      return sum + (i === indexVariante ? stockApres : v.stock.quantite);
    }, 0);
    if (totalStock === 0) {
      await this.produitRepository.mettreAJour(
        Object.assign(produit, { statut: "rupture_stock" })
      );
    } else if (produit.statut === "rupture_stock") {
      await this.produitRepository.mettreAJour(
        Object.assign(produit, { statut: "actif" })
      );
    }

    // Enregistrer le mouvement
    const mouvement = await this.mouvementRepository.creer({
      idBoutique,
      idProduit,
      idVariante: produit.variantes[indexVariante]._id,
      type,
      quantite: parseInt(quantite),
      motif,
      note: note || "",
      stockAvant,
      stockApres,
      utilisateur,
    });

    return { mouvement, stockApres };
  }

  async listerMouvements(idBoutique, options = {}) {
    return await this.mouvementRepository.trouverParBoutique(idBoutique, options);
  }

  async listerParProduit(idProduit, idBoutique) {
    const produit = await this.produitRepository.trouverParId(idProduit);
    if (!produit) throw new Error("Produit non trouvé");
    const _boutiqueId = produit.idBoutique ? (produit.idBoutique._id || produit.idBoutique).toString() : null;
    if (_boutiqueId && _boutiqueId !== idBoutique.toString()) {
      throw new Error("Ce produit n'appartient pas à votre boutique");
    }
    const mouvements = await this.mouvementRepository.trouverParProduit(idProduit, idBoutique);
    return { produit, mouvements };
  }

  async stats(idBoutique) {
    return await this.mouvementRepository.statsParBoutique(idBoutique);
  }
}

module.exports = MouvementStockService;
