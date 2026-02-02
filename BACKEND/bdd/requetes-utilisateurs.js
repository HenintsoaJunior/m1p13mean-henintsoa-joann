// Requêtes MongoDB utiles pour la gestion des utilisateurs

// =====================================
// REQUÊTES DE CONSULTATION
// =====================================

// 1. Afficher tous les utilisateurs
db.utilisateurs.find({}).pretty();

// 2. Afficher uniquement les utilisateurs actifs
db.utilisateurs.find({ actif: true }).pretty();

// 3. Compter les utilisateurs par rôle
db.utilisateurs.aggregate([
  {
    $group: {
      _id: "$role",
      count: { $sum: 1 },
    },
  },
  {
    $sort: { _id: 1 },
  },
]);

// 4. Trouver un utilisateur par email
db.utilisateurs.findOne({ email: "admin@test.com" });

// 5. Afficher les utilisateurs créés dans les dernières 24h
db.utilisateurs
  .find({
    cree_le: {
      $gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
    },
  })
  .pretty();

// 6. Chercher des utilisateurs par nom ou prénom (insensible à la casse)
db.utilisateurs
  .find({
    $or: [
      { nom: { $regex: "dupont", $options: "i" } },
      { prenom: { $regex: "jean", $options: "i" } },
    ],
  })
  .pretty();

// =====================================
// REQUÊTES DE MISE À JOUR
// =====================================

// 7. Activer/désactiver un utilisateur
db.utilisateurs.updateOne(
  { email: "client@test.com" },
  {
    $set: {
      actif: false,
      modifie_le: new Date(),
    },
  },
);

// 8. Mettre à jour le rôle d'un utilisateur
db.utilisateurs.updateOne(
  { email: "client@test.com" },
  {
    $set: {
      role: "boutique",
      modifie_le: new Date(),
    },
  },
);

// 9. Nettoyer les tokens de réinitialisation expirés
db.utilisateurs.updateMany(
  {
    expiration_reinitialisation_mdp: { $lt: new Date() },
  },
  {
    $unset: {
      token_reinitialisation_mdp: "",
      expiration_reinitialisation_mdp: "",
    },
    $set: {
      modifie_le: new Date(),
    },
  },
);

// =====================================
// REQUÊTES D'ADMINISTRATION
// =====================================

// 10. Statistiques générales des utilisateurs
db.utilisateurs.aggregate([
  {
    $facet: {
      total: [{ $count: "count" }],
      actifs: [{ $match: { actif: true } }, { $count: "count" }],
      inactifs: [{ $match: { actif: false } }, { $count: "count" }],
      par_role: [
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ],
      inscriptions_recentes: [
        {
          $match: {
            cree_le: {
              $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        { $count: "count" },
      ],
    },
  },
]);

// 11. Trouver les utilisateurs avec des tokens de réinitialisation actifs
db.utilisateurs
  .find({
    token_reinitialisation_mdp: { $ne: null },
    expiration_reinitialisation_mdp: { $gt: new Date() },
  })
  .pretty();

// 12. Supprimer les utilisateurs inactifs depuis plus de 6 mois (ATTENTION !)
/*
db.utilisateurs.deleteMany({
  actif: false,
  modifie_le: { 
    $lt: new Date(new Date().getTime() - 6*30*24*60*60*1000) 
  }
});
*/

// =====================================
// REQUÊTES DE SÉCURITÉ
// =====================================

// 13. Vérifier l'intégrité des données
db.utilisateurs.find({
  $or: [
    { email: { $exists: false } },
    { email: "" },
    { mot_de_passe: { $exists: false } },
    { mot_de_passe: "" },
    { role: { $nin: ["admin", "boutique", "client"] } },
  ],
});

// 14. Rechercher des emails en doublon
db.utilisateurs.aggregate([
  {
    $group: {
      _id: { email: "$email" },
      count: { $sum: 1 },
      docs: { $push: "$_id" },
    },
  },
  {
    $match: {
      count: { $gt: 1 },
    },
  },
]);

// =====================================
// REQUÊTES D'INDEX ET PERFORMANCE
// =====================================

// 15. Vérifier les index existants
db.utilisateurs.getIndexes();

// 16. Statistiques d'utilisation des index
db.utilisateurs.aggregate([{ $indexStats: {} }]);

// 17. Analyser la performance d'une requête
db.utilisateurs.find({ email: "admin@test.com" }).explain("executionStats");

// =====================================
// SAUVEGARDE ET EXPORT
// =====================================

// 18. Exporter les utilisateurs (à exécuter dans le terminal)
/*
mongoexport --db mean_db --collection utilisateurs --out utilisateurs_backup.json --pretty
*/

// 19. Importer des utilisateurs (à exécuter dans le terminal)
/*
mongoimport --db mean_db --collection utilisateurs --file utilisateurs_backup.json --jsonArray
*/

print("=== Requêtes MongoDB pour la gestion des utilisateurs ===");
print("Copiez et collez ces requêtes dans MongoDB Compass ou mongosh");
print(
  "Attention: Les requêtes de suppression sont commentées pour éviter les accidents",
);
