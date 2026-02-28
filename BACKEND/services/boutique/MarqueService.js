const MarqueRepository = require("../../repositories/boutique/MarqueRepository");

class MarqueService {
  constructor() {
    this.marqueRepository = new MarqueRepository();
  }

  /**
   * Service pour la logique métier des marques
   */

  /**
   * Créer une nouvelle marque
   * @param {Object} donnees - Données de la marque
   * @returns {Promise<Object>} Résultat de la création
   */
  async creerMarque(donnees) {
    const { nom, slug, description, logo, siteWeb, paysOrigine } = donnees;

    // Nettoyer le slug
    const slugNettoye = slug.toLowerCase().trim();

    // Vérifier si la marque existe déjà
    const marqueExistante = await this.marqueRepository.trouverParNom(nom);
    if (marqueExistante) {
      throw new Error("Une marque avec ce nom existe déjà");
    }

    const nouvelleMarque = await this.marqueRepository.creer({
      nom,
      slug: slugNettoye,
      description,
      logo,
      siteWeb,
      paysOrigine,
    });

    return {
      message: "Marque créée avec succès",
      marque: nouvelleMarque.toJSON(),
    };
  }

  /**
   * Obtenir une marque par ID
   * @param {string} id - ID de la marque
   * @returns {Promise<Object>} Marque trouvée
   */
  async obtenirMarqueParId(id) {
    const marque = await this.marqueRepository.trouverParId(id);
    if (!marque) {
      throw new Error("Marque non trouvée");
    }
    return marque.toJSON();
  }

  /**
   * Obtenir une marque par slug
   * @param {string} slug - Slug de la marque
   * @returns {Promise<Object>} Marque trouvée
   */
  async obtenirMarqueParSlug(slug) {
    const marque = await this.marqueRepository.trouverParSlug(slug);
    if (!marque) {
      throw new Error("Marque non trouvée");
    }
    return marque.toJSON();
  }

  /**
   * Obtenir toutes les marques
   * @param {boolean} activesSeulement - Filtrer les actives uniquement
   * @returns {Promise<Array>} Liste des marques
   */
  async obtenirToutesMarques(activesSeulement = true) {
    if (activesSeulement) {
      const marques = await this.marqueRepository.trouverActives();
      return marques.map((m) => m.toJSON());
    }
    const marques = await this.marqueRepository.trouverToutes();
    return marques.map((m) => m.toJSON());
  }

  /**
   * Mettre à jour une marque
   * @param {string} id - ID de la marque
   * @param {Object} nouvellesDonnees - Nouvelles données
   * @returns {Promise<Object>} Marque mise à jour
   */
  async mettreAJourMarque(id, nouvellesDonnees) {
    const marque = await this.marqueRepository.trouverParId(id);
    if (!marque) {
      throw new Error("Marque non trouvée");
    }

    // Vérifier le nom si modifié
    if (nouvellesDonnees.nom && nouvellesDonnees.nom !== marque.nom) {
      const marqueExistante = await this.marqueRepository.trouverParNom(nouvellesDonnees.nom);
      if (marqueExistante && marqueExistante._id.toString() !== id) {
        throw new Error("Une marque avec ce nom existe déjà");
      }
      marque.nom = nouvellesDonnees.nom;
    }

    // Vérifier le slug si modifié
    if (nouvellesDonnees.slug) {
      const slugNettoye = nouvellesDonnees.slug.toLowerCase().trim();
      const marqueExistante = await this.marqueRepository.trouverParSlug(slugNettoye);
      if (marqueExistante && marqueExistante._id.toString() !== id) {
        throw new Error("Une marque avec ce slug existe déjà");
      }
      marque.slug = slugNettoye;
    }

    // Appliquer les modifications
    if (nouvellesDonnees.description !== undefined) {
      marque.description = nouvellesDonnees.description;
    }
    if (nouvellesDonnees.logo !== undefined) {
      marque.logo = nouvellesDonnees.logo;
    }
    if (nouvellesDonnees.siteWeb !== undefined) {
      marque.siteWeb = nouvellesDonnees.siteWeb;
    }
    if (nouvellesDonnees.paysOrigine !== undefined) {
      marque.paysOrigine = nouvellesDonnees.paysOrigine;
    }
    if (nouvellesDonnees.estActif !== undefined) {
      marque.estActif = nouvellesDonnees.estActif;
    }

    const marqueMiseAJour = await this.marqueRepository.mettreAJour(marque);

    return {
      message: "Marque mise à jour avec succès",
      marque: marqueMiseAJour.toJSON(),
    };
  }

  /**
   * Supprimer une marque
   * @param {string} id - ID de la marque
   * @returns {Promise<Object>} Résultat de la suppression
   */
  async supprimerMarque(id) {
    const marque = await this.marqueRepository.trouverParId(id);
    if (!marque) {
      throw new Error("Marque non trouvée");
    }

    await this.marqueRepository.supprimer(id);

    return {
      message: "Marque supprimée avec succès",
    };
  }

  /**
   * Rechercher des marques
   * @param {string} terme - Terme de recherche
   * @returns {Promise<Array>} Liste des marques trouvées
   */
  async rechercherMarques(terme) {
    const marques = await this.marqueRepository.rechercher(terme);
    return marques.map((m) => m.toJSON());
  }
}

module.exports = MarqueService;
