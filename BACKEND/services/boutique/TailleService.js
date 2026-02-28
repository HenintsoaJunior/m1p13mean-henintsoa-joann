const TailleRepository = require("../../repositories/boutique/TailleRepository");
const TypeUniteRepository = require("../../repositories/boutique/TypeUniteRepository");

class TailleService {
  constructor() {
    this.tailleRepository = new TailleRepository();
    this.typeUniteRepository = new TypeUniteRepository();
  }

  /**
   * Service pour la logique métier des tailles
   */

  /**
   * Créer une nouvelle taille
   * @param {Object} donnees - Données de la taille
   * @returns {Promise<Object>} Résultat de la création
   */
  async creerTaille(donnees) {
    const { valeur, label, typeUniteId, ordre, estStandard } = donnees;

    // Vérifier si le type d'unité existe
    const typeUnite = await this.typeUniteRepository.trouverParId(typeUniteId);
    if (!typeUnite) {
      throw new Error("Type d'unité non trouvé");
    }

    // Vérifier si la taille existe déjà pour ce type d'unité
    const tailleExistante = await this.tailleRepository.trouverParValeurEtType(valeur, typeUniteId);
    if (tailleExistante) {
      throw new Error("Cette taille existe déjà pour ce type d'unité");
    }

    const nouvelleTaille = await this.tailleRepository.creer({
      valeur,
      label,
      typeUnite: typeUniteId,
      ordre,
      estStandard,
    });

    return {
      message: "Taille créée avec succès",
      taille: nouvelleTaille.toJSON(),
    };
  }

  /**
   * Obtenir une taille par ID
   * @param {string} id - ID de la taille
   * @returns {Promise<Object>} Taille trouvée
   */
  async obtenirTailleParId(id) {
    const taille = await this.tailleRepository.trouverParId(id);
    if (!taille) {
      throw new Error("Taille non trouvée");
    }
    return taille.toJSON();
  }

  /**
   * Obtenir toutes les tailles
   * @param {boolean} activesSeulement - Filtrer les actives uniquement
   * @returns {Promise<Array>} Liste des tailles
   */
  async obtenirToutesTailles(activesSeulement = true) {
    if (activesSeulement) {
      const tailles = await this.tailleRepository.trouverActives();
      return tailles.map((t) => t.toJSON());
    }
    const tailles = await this.tailleRepository.trouverToutes();
    return tailles.map((t) => t.toJSON());
  }

  /**
   * Obtenir les tailles par type d'unité
   * @param {string} idTypeUnite - ID du type d'unité
   * @returns {Promise<Array>} Liste des tailles
   */
  async obtenirTaillesParTypeUnite(idTypeUnite) {
    // Vérifier si le type d'unité existe
    const typeUnite = await this.typeUniteRepository.trouverParId(idTypeUnite);
    if (!typeUnite) {
      throw new Error("Type d'unité non trouvé");
    }

    const tailles = await this.tailleRepository.trouverParTypeUnite(idTypeUnite);
    return tailles.map((t) => t.toJSON());
  }

  /**
   * Obtenir les tailles standards
   * @returns {Promise<Array>} Liste des tailles standards
   */
  async obtenirTaillesStandards() {
    const tailles = await this.tailleRepository.trouverStandards();
    return tailles.map((t) => t.toJSON());
  }

  /**
   * Mettre à jour une taille
   * @param {string} id - ID de la taille
   * @param {Object} nouvellesDonnees - Nouvelles données
   * @returns {Promise<Object>} Taille mise à jour
   */
  async mettreAJourTaille(id, nouvellesDonnees) {
    const taille = await this.tailleRepository.trouverParId(id);
    if (!taille) {
      throw new Error("Taille non trouvée");
    }

    // Vérifier le type d'unité si modifié
    if (nouvellesDonnees.typeUnite) {
      const typeUnite = await this.typeUniteRepository.trouverParId(nouvellesDonnees.typeUnite);
      if (!typeUnite) {
        throw new Error("Type d'unité non trouvé");
      }
      taille.typeUnite = nouvellesDonnees.typeUnite;
    }

    // Vérifier la valeur si modifiée
    if (nouvellesDonnees.valeur && nouvellesDonnees.valeur !== taille.valeur) {
      const tailleExistante = await this.tailleRepository.trouverParValeurEtType(
        nouvellesDonnees.valeur,
        taille.typeUnite
      );
      if (tailleExistante && tailleExistante._id.toString() !== id) {
        throw new Error("Cette taille existe déjà pour ce type d'unité");
      }
      taille.valeur = nouvellesDonnees.valeur;
    }

    // Appliquer les modifications
    if (nouvellesDonnees.label !== undefined) {
      taille.label = nouvellesDonnees.label;
    }
    if (nouvellesDonnees.ordre !== undefined) {
      taille.ordre = nouvellesDonnees.ordre;
    }
    if (nouvellesDonnees.estStandard !== undefined) {
      taille.estStandard = nouvellesDonnees.estStandard;
    }
    if (nouvellesDonnees.estActif !== undefined) {
      taille.estActif = nouvellesDonnees.estActif;
    }

    const tailleMiseAJour = await this.tailleRepository.mettreAJour(taille);

    return {
      message: "Taille mise à jour avec succès",
      taille: tailleMiseAJour.toJSON(),
    };
  }

  /**
   * Supprimer une taille
   * @param {string} id - ID de la taille
   * @returns {Promise<Object>} Résultat de la suppression
   */
  async supprimerTaille(id) {
    const taille = await this.tailleRepository.trouverParId(id);
    if (!taille) {
      throw new Error("Taille non trouvée");
    }

    await this.tailleRepository.supprimer(id);

    return {
      message: "Taille supprimée avec succès",
    };
  }

  /**
   * Rechercher des tailles
   * @param {string} terme - Terme de recherche
   * @param {string} idTypeUnite - ID du type d'unité (optionnel)
   * @returns {Promise<Array>} Liste des tailles trouvées
   */
  async rechercherTailles(terme, idTypeUnite = null) {
    const tailles = await this.tailleRepository.rechercher(terme, idTypeUnite);
    return tailles.map((t) => t.toJSON());
  }
}

module.exports = TailleService;
