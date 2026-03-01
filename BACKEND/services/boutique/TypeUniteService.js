const TypeUniteRepository = require("../../repositories/boutique/TypeUniteRepository");

class TypeUniteService {
  constructor() {
    this.typeUniteRepository = new TypeUniteRepository();
  }

  /**
   * Service pour la logique métier des types d'unités
   */

  /**
   * Créer un nouveau type d'unité
   * @param {Object} donnees - Données du type d'unité
   * @returns {Promise<Object>} Résultat de la création
   */
  async creerTypeUnite(donnees) {
    const { nom, label, description, icon, valeurs } = donnees;

    // Vérifier si le type existe déjà
    const typeExistant = await this.typeUniteRepository.trouverParNom(nom);
    if (typeExistant) {
      throw new Error("Un type d'unité avec ce nom existe déjà");
    }

    const nouveauTypeUnite = await this.typeUniteRepository.creer({
      nom,
      label,
      description,
      icon,
      valeurs,
    });

    return {
      message: "Type d'unité créé avec succès",
      typeUnite: nouveauTypeUnite.toJSON(),
    };
  }

  /**
   * Obtenir un type d'unité par ID
   * @param {string} id - ID du type d'unité
   * @returns {Promise<Object>} Type d'unité trouvé
   */
  async obtenirTypeUniteParId(id) {
    const typeUnite = await this.typeUniteRepository.trouverParId(id);
    if (!typeUnite) {
      throw new Error("Type d'unité non trouvé");
    }
    return typeUnite.toJSON();
  }

  /**
   * Obtenir tous les types d'unités
   * @param {boolean} actifsSeulement - Filtrer les actifs uniquement
   * @returns {Promise<Array>} Liste des types d'unités
   */
  async obtenirTousTypesUnites(actifsSeulement = true) {
    if (actifsSeulement) {
      const types = await this.typeUniteRepository.trouverActifs();
      return types.map((t) => t.toJSON());
    }
    const types = await this.typeUniteRepository.trouverTous();
    return types.map((t) => t.toJSON());
  }

  /**
   * Mettre à jour un type d'unité
   * @param {string} id - ID du type d'unité
   * @param {Object} nouvellesDonnees - Nouvelles données
   * @returns {Promise<Object>} Type d'unité mis à jour
   */
  async mettreAJourTypeUnite(id, nouvellesDonnees) {
    const typeUnite = await this.typeUniteRepository.trouverParId(id);
    if (!typeUnite) {
      throw new Error("Type d'unité non trouvé");
    }

    // Vérifier le nom si modifié
    if (nouvellesDonnees.nom && nouvellesDonnees.nom !== typeUnite.nom) {
      const typeExistant = await this.typeUniteRepository.trouverParNom(nouvellesDonnees.nom);
      if (typeExistant && typeExistant._id.toString() !== id) {
        throw new Error("Un type d'unité avec ce nom existe déjà");
      }
    }

    // Appliquer les modifications
    if (nouvellesDonnees.label !== undefined) {
      typeUnite.label = nouvellesDonnees.label;
    }
    if (nouvellesDonnees.description !== undefined) {
      typeUnite.description = nouvellesDonnees.description;
    }
    if (nouvellesDonnees.icon !== undefined) {
      typeUnite.icon = nouvellesDonnees.icon;
    }
    if (nouvellesDonnees.estActif !== undefined) {
      typeUnite.estActif = nouvellesDonnees.estActif;
    }

    const typeUniteMisAJour = await this.typeUniteRepository.mettreAJour(typeUnite);

    return {
      message: "Type d'unité mis à jour avec succès",
      typeUnite: typeUniteMisAJour.toJSON(),
    };
  }

  /**
   * Supprimer un type d'unité
   * @param {string} id - ID du type d'unité
   * @returns {Promise<Object>} Résultat de la suppression
   */
  async supprimerTypeUnite(id) {
    const typeUnite = await this.typeUniteRepository.trouverParId(id);
    if (!typeUnite) {
      throw new Error("Type d'unité non trouvé");
    }

    await this.typeUniteRepository.supprimer(id);

    return {
      message: "Type d'unité supprimé avec succès",
    };
  }

  /**
   * Ajouter une valeur à un type d'unité
   * @param {string} id - ID du type d'unité
   * @param {string} valeur - Valeur à ajouter
   * @returns {Promise<Object>} Type d'unité mis à jour
   */
  async ajouterValeur(id, valeur) {
    const typeUnite = await this.typeUniteRepository.trouverParId(id);
    if (!typeUnite) {
      throw new Error("Type d'unité non trouvé");
    }

    const typeUniteMisAJour = await this.typeUniteRepository.ajouterValeur(id, valeur);

    return {
      message: "Valeur ajoutée avec succès",
      typeUnite: typeUniteMisAJour.toJSON(),
    };
  }

  /**
   * Supprimer une valeur d'un type d'unité
   * @param {string} id - ID du type d'unité
   * @param {string} valeur - Valeur à supprimer
   * @returns {Promise<Object>} Type d'unité mis à jour
   */
  async supprimerValeur(id, valeur) {
    const typeUnite = await this.typeUniteRepository.trouverParId(id);
    if (!typeUnite) {
      throw new Error("Type d'unité non trouvé");
    }

    const typeUniteMisAJour = await this.typeUniteRepository.supprimerValeur(id, valeur);

    return {
      message: "Valeur supprimée avec succès",
      typeUnite: typeUniteMisAJour.toJSON(),
    };
  }
}

module.exports = TypeUniteService;
