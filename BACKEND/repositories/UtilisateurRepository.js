const Utilisateur = require("../models/Utilisateur");

class UtilisateurRepository {
  /**
   * Repository pour l'accès aux données des utilisateurs
   * Abstraction de la couche de données
   */

  /**
   * Créer un nouvel utilisateur
   * @param {Object} donneesUtilisateur - Données de l'utilisateur
   * @returns {Promise<Object>} Utilisateur créé
   */
  async creer(donneesUtilisateur) {
    const utilisateur = new Utilisateur(donneesUtilisateur);
    await utilisateur.save();
    return utilisateur;
  }

  /**
   * Trouver un utilisateur par email
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise<Object|null>} Utilisateur trouvé ou null
   */
  async trouverParEmail(email) {
    return await Utilisateur.findOne({
      email: email.toLowerCase().trim(),
      actif: true,
    });
  }

  /**
   * Trouver un utilisateur par ID
   * @param {string} id - ID de l'utilisateur
   * @returns {Promise<Object|null>} Utilisateur trouvé ou null
   */
  async trouverParId(id) {
    return await Utilisateur.findById(id);
  }

  /**
   * Trouver un utilisateur par ses identifiants
   * @param {string} email - Email de l'utilisateur
   * @param {string} motDePasse - Mot de passe
   * @returns {Promise<Object>} Utilisateur trouvé
   */
  async trouverParIdentifiants(email, motDePasse) {
    // Recherche de l'utilisateur par email
    const utilisateur = await Utilisateur.findOne({
      email: email.toLowerCase().trim(),
      actif: true,
    });

    if (!utilisateur) {
      throw new Error("Email ou mot de passe incorrect");
    }

    // Vérification du mot de passe
    const estValide = await utilisateur.comparerMotDePasse(motDePasse);
    if (!estValide) {
      throw new Error("Email ou mot de passe incorrect");
    }

    return utilisateur;
  }

  /**
   * Mettre à jour un utilisateur
   * @param {Object} utilisateur - Instance de l'utilisateur
   * @returns {Promise<Object>} Utilisateur mis à jour
   */
  async mettreAJour(utilisateur) {
    await utilisateur.save();
    return utilisateur;
  }

  /**
   * Trouver un utilisateur par token de réinitialisation
   * @param {string} token - Token de réinitialisation
   * @returns {Promise<Object|null>} Utilisateur trouvé ou null
   */
  async trouverParTokenReinitialisation(token) {
    return await Utilisateur.findOne({
      token_reinitialisation_mdp: token,
      expiration_reinitialisation_mdp: { $gt: Date.now() },
    });
  }

  /**
   * Obtenir une liste paginée d'utilisateurs
   * @param {Object} filtres - Filtres de recherche
   * @param {Object} pagination - Options de pagination
   * @returns {Promise<Object>} Résultat avec utilisateurs et pagination
   */
  async obtenirListeAvecPagination(filtres = {}, pagination = {}) {
    const { page = 1, limite = 10 } = pagination;
    const { role, actif } = filtres;

    // Construction du filtre MongoDB
    const filtreQuery = {};
    if (role && ["admin", "boutique", "client"].includes(role)) {
      filtreQuery.role = role;
    }
    if (actif !== undefined) {
      filtreQuery.actif = actif === "true";
    }

    const [utilisateurs, total] = await Promise.all([
      Utilisateur.find(filtreQuery)
        .select(
          "-mot_de_passe -token_reinitialisation_mdp -expiration_reinitialisation_mdp",
        )
        .limit(parseInt(limite))
        .skip((parseInt(page) - 1) * parseInt(limite))
        .sort({ cree_le: -1 }),
      Utilisateur.countDocuments(filtreQuery),
    ]);

    return {
      utilisateurs,
      pagination: {
        page: parseInt(page),
        limite: parseInt(limite),
        total,
        pages: Math.ceil(total / parseInt(limite)),
      },
    };
  }

  /**
   * Compter les utilisateurs par rôle
   * @returns {Promise<Array>} Statistiques par rôle
   */
  async compterParRole() {
    return await Utilisateur.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);
  }

  /**
   * Rechercher des utilisateurs par critères
   * @param {Object} criteres - Critères de recherche
   * @returns {Promise<Array>} Liste des utilisateurs trouvés
   */
  async rechercher(criteres) {
    const filtre = {};

    if (criteres.email) {
      filtre.email = { $regex: criteres.email, $options: "i" };
    }

    if (criteres.nom) {
      filtre.$or = [
        { nom: { $regex: criteres.nom, $options: "i" } },
        { prenom: { $regex: criteres.nom, $options: "i" } },
      ];
    }

    if (criteres.role) {
      filtre.role = criteres.role;
    }

    return await Utilisateur.find(filtre)
      .select(
        "-mot_de_passe -token_reinitialisation_mdp -expiration_reinitialisation_mdp",
      )
      .limit(20);
  }

  /**
   * Supprimer un utilisateur (soft delete)
   * @param {string} id - ID de l'utilisateur
   * @returns {Promise<Object>} Utilisateur désactivé
   */
  async supprimerSoft(id) {
    return await Utilisateur.findByIdAndUpdate(
      id,
      { actif: false },
      { new: true },
    );
  }

  /**
   * Vérifier si un email existe déjà
   * @param {string} email - Email à vérifier
   * @param {string} excludeId - ID à exclure de la vérification
   * @returns {Promise<boolean>} True si l'email existe
   */
  async emailExiste(email, excludeId = null) {
    const query = { email: email.toLowerCase().trim() };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const utilisateur = await Utilisateur.findOne(query);
    return !!utilisateur;
  }
}

module.exports = UtilisateurRepository;
