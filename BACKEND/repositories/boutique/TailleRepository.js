const Taille = require("../../models/boutique/Taille");

class TailleRepository {
  /**
   * Repository pour l'accès aux données des tailles
   */

  /**
   * Créer une nouvelle taille
   * @param {Object} donnees - Données de la taille
   * @returns {Promise<Object>} Taille créée
   */
  async creer(donnees) {
    const taille = new Taille(donnees);
    await taille.save();
    return taille;
  }

  /**
   * Trouver une taille par ID
   * @param {string} id - ID de la taille
   * @returns {Promise<Object|null>} Taille trouvée ou null
   */
  async trouverParId(id) {
    return await Taille.findById(id).populate("typeUnite");
  }

  /**
   * Trouver une taille par valeur et type d'unité
   * @param {string} valeur - Valeur de la taille
   * @param {string} idTypeUnite - ID du type d'unité
   * @returns {Promise<Object|null>} Taille trouvée ou null
   */
  async trouverParValeurEtType(valeur, idTypeUnite) {
    return await Taille.findOne({
      valeur: valeur.toLowerCase().trim(),
      typeUnite: idTypeUnite,
    }).populate("typeUnite");
  }

  /**
   * Trouver toutes les tailles
   * @returns {Promise<Array>} Liste des tailles
   */
  async trouverToutes() {
    return await Taille.find()
      .populate("typeUnite")
      .sort({ typeUnite: 1, ordre: 1, valeur: 1 });
  }

  /**
   * Trouver les tailles actives
   * @returns {Promise<Array>} Liste des tailles actives
   */
  async trouverActives() {
    return await Taille.find({ estActif: true })
      .populate("typeUnite")
      .sort({ typeUnite: 1, ordre: 1, valeur: 1 });
  }

  /**
   * Trouver les tailles par type d'unité
   * @param {string} idTypeUnite - ID du type d'unité
   * @returns {Promise<Array>} Liste des tailles
   */
  async trouverParTypeUnite(idTypeUnite) {
    return await Taille.find({ typeUnite: idTypeUnite, estActif: true }).sort(
      { ordre: 1, valeur: 1 }
    );
  }

  /**
   * Trouver les tailles standards
   * @returns {Promise<Array>} Liste des tailles standards
   */
  async trouverStandards() {
    return await Taille.find({ estStandard: true, estActif: true })
      .populate("typeUnite")
      .sort({ ordre: 1 });
  }

  /**
   * Mettre à jour une taille
   * @param {Object} taille - Instance de la taille
   * @returns {Promise<Object>} Taille mise à jour
   */
  async mettreAJour(taille) {
    await taille.save();
    return taille;
  }

  /**
   * Supprimer une taille
   * @param {string} id - ID de la taille
   * @returns {Promise<Object>} Taille supprimée
   */
  async supprimer(id) {
    return await Taille.findByIdAndDelete(id);
  }

  /**
   * Rechercher des tailles par terme
   * @param {string} terme - Terme de recherche
   * @param {string} idTypeUnite - ID du type d'unité (optionnel)
   * @returns {Promise<Array>} Liste des tailles trouvées
   */
  async rechercher(terme, idTypeUnite = null) {
    const filtre = {
      valeur: { $regex: terme, $options: "i" },
      estActif: true,
    };

    if (idTypeUnite) {
      filtre.typeUnite = idTypeUnite;
    }

    return await Taille.find(filtre)
      .populate("typeUnite")
      .limit(20);
  }
}

module.exports = TailleRepository;
