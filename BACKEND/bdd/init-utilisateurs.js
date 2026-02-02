// Script MongoDB pour initialiser la base de données avec des utilisateurs de test
// Exécuter dans MongoDB Compass ou avec mongosh

// Utiliser la base de données
use('mean_db');

// Supprimer la collection utilisateurs si elle existe (pour reset)
db.utilisateurs.drop();

// Créer la collection utilisateurs avec validation
db.createCollection("utilisateurs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "Utilisateur Object Validation",
      required: ["email", "mot_de_passe", "prenom", "nom", "role"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Email doit être une adresse email valide"
        },
        mot_de_passe: {
          bsonType: "string",
          minLength: 6,
          description: "Mot de passe doit contenir au moins 6 caractères"
        },
        prenom: {
          bsonType: "string",
          maxLength: 50,
          description: "Prénom ne peut pas dépasser 50 caractères"
        },
        nom: {
          bsonType: "string",
          maxLength: 50,
          description: "Nom ne peut pas dépasser 50 caractères"
        },
        telephone: {
          bsonType: ["string", "null"],
          description: "Téléphone optionnel"
        },
        role: {
          bsonType: "string",
          enum: ["admin", "boutique", "client"],
          description: "Rôle doit être admin, boutique ou client"
        },
        actif: {
          bsonType: "bool",
          description: "Statut actif de l'utilisateur"
        },
        cree_le: {
          bsonType: "date",
          description: "Date de création"
        },
        modifie_le: {
          bsonType: "date",
          description: "Date de modification"
        },
        token_reinitialisation_mdp: {
          bsonType: ["string", "null"],
          description: "Token de réinitialisation du mot de passe"
        },
        expiration_reinitialisation_mdp: {
          bsonType: ["date", "null"],
          description: "Date d'expiration du token de réinitialisation"
        }
      }
    }
  }
});

// Créer les index pour optimiser les performances
db.utilisateurs.createIndex({ "email": 1 }, { unique: true, name: "email_unique" });
db.utilisateurs.createIndex({ "role": 1 }, { name: "role_index" });
db.utilisateurs.createIndex({ "actif": 1 }, { name: "actif_index" });
db.utilisateurs.createIndex({ "token_reinitialisation_mdp": 1 }, { name: "token_reset_index" });

print("Collection utilisateurs créée avec succès !");
print("Index créés:");
print("- email_unique: Index unique sur le champ email");
print("- role_index: Index sur le champ role");
print("- actif_index: Index sur le champ actif");
print("- token_reset_index: Index sur le token de réinitialisation");

// Fonction pour insérer des utilisateurs de test
print("\n=== Insertion des utilisateurs de test ===");

// Note: Les mots de passe seront hashés par l'application
// Ces données sont pour les tests seulement

const utilisateursTest = [
  {
    email: "admin@test.com",
    mot_de_passe: "Admin123!", // Sera hashé par l'application
    prenom: "Admin",
    nom: "Système",
    telephone: "+261 32 00 000 01",
    role: "admin",
    actif: true,
    cree_le: new Date(),
    modifie_le: new Date(),
    token_reinitialisation_mdp: null,
    expiration_reinitialisation_mdp: null
  },
  {
    email: "boutique@test.com",
    mot_de_passe: "Boutique123!", // Sera hashé par l'application
    prenom: "Manager",
    nom: "Boutique",
    telephone: "+261 32 00 000 02",
    role: "boutique",
    actif: true,
    cree_le: new Date(),
    modifie_le: new Date(),
    token_reinitialisation_mdp: null,
    expiration_reinitialisation_mdp: null
  },
  {
    email: "client@test.com",
    mot_de_passe: "Client123!", // Sera hashé par l'application
    prenom: "Jean",
    nom: "Dupont",
    telephone: "+261 32 00 000 03",
    role: "client",
    actif: true,
    cree_le: new Date(),
    modifie_le: new Date(),
    token_reinitialisation_mdp: null,
    expiration_reinitialisation_mdp: null
  }
];

print("ATTENTION: Les utilisateurs suivants sont des données de test.");
print("Les mots de passe doivent être hashés par l'application avant l'insertion.");
print("Utilisez l'API d'inscription pour créer des vrais utilisateurs.\n");

utilisateursTest.forEach((utilisateur, index) => {
  print(`Utilisateur ${index + 1}:`);
  print(`  Email: ${utilisateur.email}`);
  print(`  Mot de passe: ${utilisateur.mot_de_passe}`);
  print(`  Rôle: ${utilisateur.role}`);
  print("");
});

print("=== Script terminé ===");
print("Base de données initialisée avec succès !");
print("\nPour tester l'API:");
print("1. Démarrez le serveur: npm run dev");
print("2. Utilisez les endpoints d'inscription pour créer des utilisateurs");
print("3. Ou utilisez les utilisateurs de test ci-dessus via l'API");