const Produit = require("../../models/boutique/Produit");

class ProduitRepository {
  /**
   * Repository pour l'accès aux données des produits
   * Abstraction de la couche de données
   */

  /**
   * Créer un nouveau produit
   * @param {Object} donneesProduit - Données du produit
   * @returns {Promise<Object>} Produit créé
   */
  async creer(donneesProduit) {
    const produit = new Produit(donneesProduit);
    await produit.save();
    return produit;
  }

  /**
   * Trouver un produit par ID
   * @param {string} id - ID du produit
   * @returns {Promise<Object|null>} Produit trouvé ou null
   */
  async trouverParId(id) {
    return await Produit.findById(id)
      .populate("idCategorie")
      .populate("idBoutique");
  }

  /**
   * Trouver un produit par slug
   * @param {string} slug - Slug du produit
   * @returns {Promise<Object|null>} Produit trouvé ou null
   */
  async trouverParSlug(slug) {
    return await Produit.findOne({ slug: slug.toLowerCase().trim() })
      .populate("idCategorie")
      .populate("idBoutique");
  }

  /**
   * Trouver tous les produits d'une boutique
   * @param {string} idBoutique - ID de la boutique
   * @returns {Promise<Array>} Liste des produits
   */
  async trouverParBoutique(idBoutique) {
    return await Produit.find({ idBoutique })
      .populate("idCategorie")
      .sort({ nom: 1 });
  }

  /**
   * Trouver les produits par catégorie
   * @param {string} idCategorie - ID de la catégorie
   * @returns {Promise<Array>} Liste des produits
   */
  async trouverParCategorie(idCategorie) {
    return await Produit.find({ idCategorie })
      .populate("idBoutique")
      .sort({ nom: 1 });
  }

  /**
   * Trouver les produits par statut
   * @param {string} statut - Statut des produits
   * @returns {Promise<Array>} Liste des produits
   */
  async trouverParStatut(statut) {
    return await Produit.find({ statut })
      .populate("idCategorie")
      .populate("idBoutique")
      .sort({ nom: 1 });
  }

  /**
   * Mettre à jour un produit
   * @param {Object} produit - Instance du produit
   * @returns {Promise<Object>} Produit mis à jour
   */
  async mettreAJour(produit) {
    await produit.save();
    return produit;
  }

  /**
   * Supprimer un produit
   * @param {string} id - ID du produit
   * @returns {Promise<Object>} Produit supprimé
   */
  async supprimer(id) {
    return await Produit.findByIdAndDelete(id);
  }

  /**
   * Obtenir une liste paginée de produits
   * @param {Object} filtres - Filtres de recherche
   * @param {Object} pagination - Options de pagination
   * @returns {Promise<Object>} Résultat avec produits et pagination
   */
  async obtenirListeAvecPagination(filtres = {}, pagination = {}) {
    const { page = 1, limite = 10 } = pagination;
    const { idBoutique, idCategorie, statut } = filtres;

    const filtreQuery = {};
    if (idBoutique) {
      filtreQuery.idBoutique = idBoutique;
    }
    if (idCategorie) {
      filtreQuery.idCategorie = idCategorie;
    }
    if (statut && ["actif", "rupture_stock", "archive"].includes(statut)) {
      filtreQuery.statut = statut;
    }

    const [produits, total] = await Promise.all([
      Produit.find(filtreQuery)
        .populate("idCategorie", "nom slug")
        .limit(parseInt(limite))
        .skip((parseInt(page) - 1) * parseInt(limite))
        .sort({ dateCreation: -1 }),
      Produit.countDocuments(filtreQuery),
    ]);

    return {
      produits,
      pagination: {
        page: parseInt(page),
        limite: parseInt(limite),
        total,
        pages: Math.ceil(total / parseInt(limite)),
      },
    };
  }

  /**
   * Rechercher des produits par terme
   * @param {string} terme - Terme de recherche
   * @param {string} idBoutique - ID de la boutique (optionnel)
   * @returns {Promise<Array>} Liste des produits trouvés
   */
  async rechercher(terme, idBoutique = null) {
    const filtre = {
      $or: [
        { nom: { $regex: terme, $options: "i" } },
        { description: { $regex: terme, $options: "i" } },
      ],
    };

    if (idBoutique) {
      filtre.idBoutique = idBoutique;
    }

    return await Produit.find(filtre)
      .populate("idCategorie", "nom slug")
      .limit(20);
  }

  /**
   * Mettre à jour le stock d'un produit
   * @param {string} id - ID du produit
   * @param {number} quantite - Nouvelle quantité
   * @returns {Promise<Object>} Produit mis à jour
   */
  async mettreAJourStock(id, quantite) {
    return await Produit.findByIdAndUpdate(
      id,
      { "stock.quantite": quantite },
      { new: true }
    );
  }

  /**
   * Vérifier si un slug existe déjà pour une boutique
   * @param {string} slug - Slug à vérifier
   * @param {string} idBoutique - ID de la boutique
   * @param {string} excludeId - ID à exclure de la vérification
   * @returns {Promise<boolean>} True si le slug existe
   */
  async slugExiste(slug, idBoutique, excludeId = null) {
    const query = { slug: slug.toLowerCase().trim(), idBoutique };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const produit = await Produit.findOne(query);
    return !!produit;
  }
}

module.exports = ProduitRepository;
