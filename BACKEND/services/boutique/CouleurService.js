const CouleurRepository = require("../../repositories/boutique/CouleurRepository");

class CouleurService {
  constructor() {
    this.couleurRepository = new CouleurRepository();
  }

  /**
   * Service pour la logique métier des couleurs
   */

  /**
   * Créer une nouvelle couleur
   * @param {Object} donnees - Données de la couleur
   * @returns {Promise<Object>} Résultat de la création
   */
  async creerCouleur(donnees) {
    const { nom, codeHex, categorie } = donnees;

    // Nettoyer le code hex
    const codeHexNettoye = codeHex.toUpperCase().trim();

    // Vérifier si la couleur existe déjà
    const couleurExistante = await this.couleurRepository.trouverParCodeHex(codeHexNettoye);
    if (couleurExistante) {
      throw new Error("Une couleur avec ce code hexadécimal existe déjà");
    }

    const nouvelleCouleur = await this.couleurRepository.creer({
      nom,
      codeHex: codeHexNettoye,
      categorie,
    });

    return {
      message: "Couleur créée avec succès",
      couleur: nouvelleCouleur.toJSON(),
    };
  }

  /**
   * Obtenir une couleur par ID
   * @param {string} id - ID de la couleur
   * @returns {Promise<Object>} Couleur trouvée
   */
  async obtenirCouleurParId(id) {
    const couleur = await this.couleurRepository.trouverParId(id);
    if (!couleur) {
      throw new Error("Couleur non trouvée");
    }
    return couleur.toJSON();
  }

  /**
   * Obtenir toutes les couleurs
   * @param {boolean} activesSeulement - Filtrer les actives uniquement
   * @returns {Promise<Array>} Liste des couleurs
   */
  async obtenirToutesCouleurs(activesSeulement = true) {
    if (activesSeulement) {
      const couleurs = await this.couleurRepository.trouverActives();
      return couleurs.map((c) => c.toJSON());
    }
    const couleurs = await this.couleurRepository.trouverToutes();
    return couleurs.map((c) => c.toJSON());
  }

  /**
   * Obtenir les couleurs par catégorie
   * @param {string} categorie - Catégorie de couleur
   * @returns {Promise<Array>} Liste des couleurs
   */
  async obtenirCouleursParCategorie(categorie) {
    const couleurs = await this.couleurRepository.trouverParCategorie(categorie);
    return couleurs.map((c) => c.toJSON());
  }

  /**
   * Mettre à jour une couleur
   * @param {string} id - ID de la couleur
   * @param {Object} nouvellesDonnees - Nouvelles données
   * @returns {Promise<Object>} Couleur mise à jour
   */
  async mettreAJourCouleur(id, nouvellesDonnees) {
    const couleur = await this.couleurRepository.trouverParId(id);
    if (!couleur) {
      throw new Error("Couleur non trouvée");
    }

    // Vérifier le code hex si modifié
    if (nouvellesDonnees.codeHex) {
      const codeHexNettoye = nouvellesDonnees.codeHex.toUpperCase().trim();
      const couleurExistante = await this.couleurRepository.trouverParCodeHex(codeHexNettoye);
      if (couleurExistante && couleurExistante._id.toString() !== id) {
        throw new Error("Une couleur avec ce code hexadécimal existe déjà");
      }
      couleur.codeHex = codeHexNettoye;
    }

    // Appliquer les modifications
    if (nouvellesDonnees.nom !== undefined) {
      couleur.nom = nouvellesDonnees.nom;
    }
    if (nouvellesDonnees.categorie !== undefined) {
      couleur.categorie = nouvellesDonnees.categorie;
    }
    if (nouvellesDonnees.estActif !== undefined) {
      couleur.estActif = nouvellesDonnees.estActif;
    }

    const couleurMiseAJour = await this.couleurRepository.mettreAJour(couleur);

    return {
      message: "Couleur mise à jour avec succès",
      couleur: couleurMiseAJour.toJSON(),
    };
  }

  /**
   * Supprimer une couleur
   * @param {string} id - ID de la couleur
   * @returns {Promise<Object>} Résultat de la suppression
   */
  async supprimerCouleur(id) {
    const couleur = await this.couleurRepository.trouverParId(id);
    if (!couleur) {
      throw new Error("Couleur non trouvée");
    }

    await this.couleurRepository.supprimer(id);

    return {
      message: "Couleur supprimée avec succès",
    };
  }

  /**
   * Rechercher des couleurs
   * @param {string} terme - Terme de recherche
   * @returns {Promise<Array>} Liste des couleurs trouvées
   */
  async rechercherCouleurs(terme) {
    const couleurs = await this.couleurRepository.rechercher(terme);
    return couleurs.map((c) => c.toJSON());
  }
}

module.exports = CouleurService;
