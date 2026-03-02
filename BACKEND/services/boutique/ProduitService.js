const ProduitRepository = require("../../repositories/boutique/ProduitRepository");
const PromotionService = require("../../services/boutique/PromotionService");

class ProduitService {
  constructor() {
    this.produitRepository = new ProduitRepository();
    this.promoService = new PromotionService();
  }

  /**
   * Service pour la logique métier des produits
   * Pure logique métier, indépendant de la base de données
   */

  /**
   * Créer un nouveau produit
   * @param {Object} donneesProduit - Données du produit
   * @returns {Promise<Object>} Résultat de la création
   */
  async creerProduit(donneesProduit) {
    const {
      idBoutique,
      idCategorie,
      nom,
      slug,
      description,
      images,
      attributs,
      variantes,
      statut,
    } = donneesProduit;

    // Nettoyage et validation des données
    const donneesNettoyees = this.nettoyerDonneesProduit({
      idBoutique,
      idCategorie,
      nom,
      slug,
      description,
      images,
      attributs,
      variantes,
      statut,
    });

    // Vérification de l'unicité du slug
    await this.verifierSlugUnique(donneesNettoyees.slug, donneesNettoyees.idBoutique);

    // Création du produit
    const nouveauProduit = await this.produitRepository.creer(donneesNettoyees);

    return {
      message: "Produit créé avec succès",
      produit: nouveauProduit.toJSON(),
    };
  }

  /**
   * Mettre à jour un produit
   * @param {string} produitId - ID du produit
   * @param {Object} nouvellesDonnees - Nouvelles données
   * @returns {Promise<Object>} Produit mis à jour
   */
  async mettreAJourProduit(produitId, nouvellesDonnees) {
    // Récupération du produit
    const produit = await this.produitRepository.trouverParId(produitId);
    if (!produit) {
      throw new Error("Produit non trouvé");
    }

    // Nettoyage et validation des données
    const donneesNettoyees = this.nettoyerDonneesProduit(nouvellesDonnees);

    // Vérification du slug si modifié
    if (donneesNettoyees.slug && donneesNettoyees.slug !== produit.slug) {
      if (await this.produitRepository.slugExiste(donneesNettoyees.slug, produit.idBoutique, produit._id)) {
        throw new Error("Un produit avec ce slug existe déjà dans cette boutique");
      }
    }

    // Application des modifications
    this.appliquerModificationsProduit(produit, donneesNettoyees);

    // Sauvegarde
    const produitMisAJour = await this.produitRepository.mettreAJour(produit);

    return {
      message: "Produit mis à jour avec succès",
      produit: produitMisAJour.toJSON(),
    };
  }

  /**
   * Supprimer un produit
   * @param {string} produitId - ID du produit
   * @returns {Promise<Object>} Résultat de la suppression
   */
  async supprimerProduit(produitId) {
    const produit = await this.produitRepository.trouverParId(produitId);
    if (!produit) {
      throw new Error("Produit non trouvé");
    }

    await this.produitRepository.supprimer(produitId);

    return {
      message: "Produit supprimé avec succès",
    };
  }

  /**
   * Obtenir un produit par ID
   * @param {string} produitId - ID du produit
   * @returns {Promise<Object>} Produit trouvé
   */
  async obtenirProduitParId(produitId) {
    const produit = await this.produitRepository.trouverParId(produitId);
    if (!produit) {
      throw new Error("Produit non trouvé");
    }
    let result = produit.toJSON();
    const promos = await this.promoService.annoterProduits([produit]);
    if (promos[0]) {
      result = promos[0];
    }
    return result;
  }

  /**
   * Obtenir un produit par slug
   * @param {string} slug - Slug du produit
   * @returns {Promise<Object>} Produit trouvé
   */
  async obtenirProduitParSlug(slug) {
    const produit = await this.produitRepository.trouverParSlug(slug);
    if (!produit) {
      throw new Error("Produit non trouvé");
    }
    let result = produit.toJSON();
    const promos = await this.promoService.annoterProduits([produit]);
    if (promos[0]) {
      result = promos[0];
    }
    return result;
  }

  /**
   * Obtenir tous les produits d'une boutique
   * @param {string} idBoutique - ID de la boutique
   * @returns {Promise<Array>} Liste des produits
   */
  async obtenirProduitsParBoutique(idBoutique) {
    let produits = await this.produitRepository.trouverParBoutique(idBoutique);
    produits = produits.map(p => p); // keep mongoose objects
    produits = await this.promoService.annoterProduits(produits);
    return produits;
  }

  /**
   * Obtenir les produits par catégorie
   * @param {string} idCategorie - ID de la catégorie
   * @returns {Promise<Array>} Liste des produits
   */
  async obtenirProduitsParCategorie(idCategorie) {
    let produits = await this.produitRepository.trouverParCategorie(idCategorie);
    produits = produits.map(p => p);
    produits = await this.promoService.annoterProduits(produits);
    return produits;
  }

  /**
   * Obtenir les produits par statut
   * @param {string} statut - Statut des produits
   * @returns {Promise<Array>} Liste des produits
   */
  async obtenirProduitsParStatut(statut) {
    let produits = await this.produitRepository.trouverParStatut(statut);
    produits = produits.map(p => p);
    produits = await this.promoService.annoterProduits(produits);
    return produits;
  }

  /**
   * Mettre à jour le stock d'un produit
   * @param {string} produitId - ID du produit
   * @param {number} quantite - Nouvelle quantité
   * @returns {Promise<Object>} Produit mis à jour
   */
  async mettreAJourStock(produitId, quantite) {
    if (quantite < 0) {
      throw new Error("La quantité ne peut pas être négative");
    }

    const produit = await this.produitRepository.mettreAJourStock(produitId, quantite);
    if (!produit) {
      throw new Error("Produit non trouvé");
    }

    return {
      message: "Stock mis à jour avec succès",
      produit: produit.toJSON(),
    };
  }

  /**
   * Rechercher des produits
   * @param {string} terme - Terme de recherche
   * @param {string} idBoutique - ID de la boutique (optionnel)
   * @returns {Promise<Array>} Liste des produits trouvés
   */
  async rechercherProduits(terme, idBoutique = null) {
    const produits = await this.produitRepository.rechercher(terme, idBoutique);
    return produits.map(p => p.toJSON());
  }

  /**
   * Obtenir une liste paginée de produits
   * @param {Object} filtres - Filtres de recherche
   * @param {Object} pagination - Options de pagination
   * @returns {Promise<Object>} Liste paginée des produits
   */
  async obtenirListeProduits(filtres, pagination) {
    const filtresValides = this.validerFiltresListe(filtres);
    const paginationValide = this.validerPagination(pagination);

    const resultat = await this.produitRepository.obtenirListeAvecPagination(filtresValides, paginationValide);
    if (resultat && Array.isArray(resultat.produits) && resultat.produits.length) {
      // annoter chaque produit avec promotion active
      resultat.produits = await this.promoService.annoterProduits(
        resultat.produits.map(p => p)
      );
    }
    return resultat;
  }

  // ========== MÉTHODES PRIVÉES DE VALIDATION ==========

  /**
   * Vérifier l'unicité du slug
   * @param {string} slug - Slug à vérifier
   * @param {string} idBoutique - ID de la boutique
   * @private
   */
  async verifierSlugUnique(slug, idBoutique) {
    if (await this.produitRepository.slugExiste(slug, idBoutique)) {
      throw new Error("Un produit avec ce slug existe déjà dans cette boutique");
    }
  }

  /**
   * Nettoyer les données de produit
   * @param {Object} donnees - Données brutes
   * @returns {Object} Données nettoyées
   * @private
   */
  nettoyerDonneesProduit(donnees) {
    const nettoyees = {};

    if (donnees.idBoutique) {
      nettoyees.idBoutique = donnees.idBoutique;
    }
    if (donnees.idCategorie) {
      if (Array.isArray(donnees.idCategorie)) {
        nettoyees.idCategorie = donnees.idCategorie.filter(Boolean);
      } else if (typeof donnees.idCategorie === 'string') {
        nettoyees.idCategorie = donnees.idCategorie.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        nettoyees.idCategorie = [donnees.idCategorie];
      }
    }
    if (donnees.nom) {
      nettoyees.nom = donnees.nom.trim();
    }
    if (donnees.slug) {
      nettoyees.slug = donnees.slug.toLowerCase().trim();
    }
    if (donnees.description !== undefined) {
      nettoyees.description = donnees.description ? donnees.description.trim() : null;
    }
    if (donnees.images) {
      nettoyees.images = Array.isArray(donnees.images) ? donnees.images : [];
    }
    if (donnees.variantes && Array.isArray(donnees.variantes)) {
      nettoyees.variantes = donnees.variantes.map(variante => ({
        couleur: variante.couleur ? variante.couleur.trim() : '',
        couleurHex: variante.couleurHex ? variante.couleurHex.trim() : '',
        unite: variante.unite ? variante.unite.trim() : '',
        typeUnitePrincipal: variante.typeUnitePrincipal || null,
        prix: {
          devise: (variante.prix?.devise || "Ar").toUpperCase().trim(),
          montant: parseFloat(variante.prix?.montant) || 0,
        },
        stock: {
          quantite: parseInt(variante.stock?.quantite) >= 0 ? parseInt(variante.stock?.quantite) : 0,
        },
      }));
    }
    if (donnees.statut && ["actif", "rupture_stock", "archive"].includes(donnees.statut)) {
      nettoyees.statut = donnees.statut;
    }

    return nettoyees;
  }

  /**
   * Appliquer les modifications à un produit
   * @param {Object} produit - Instance produit
   * @param {Object} donnees - Nouvelles données
   * @private
   */
  appliquerModificationsProduit(produit, donnees) {
    Object.keys(donnees).forEach((cle) => {
      if (donnees[cle] !== undefined) {
        produit[cle] = donnees[cle];
      }
    });
  }

  /**
   * Valider les filtres de liste
   * @param {Object} filtres - Filtres à valider
   * @returns {Object} Filtres validés
   * @private
   */
  validerFiltresListe(filtres = {}) {
    const filtresValides = {};

    if (filtres.idBoutique) {
      filtresValides.idBoutique = filtres.idBoutique;
    }
    if (filtres.idCategorie) {
      filtresValides.idCategorie = filtres.idCategorie;
    }
    if (filtres.statut && ["actif", "rupture_stock", "archive"].includes(filtres.statut)) {
      filtresValides.statut = filtres.statut;
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
}

module.exports = ProduitService;
