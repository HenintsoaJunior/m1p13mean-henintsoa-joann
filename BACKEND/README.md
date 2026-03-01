# 🏗️ Architecture Backend - MEAN Stack

Backend complet pour une application de gestion de centres commerciaux avec système d'appels d'offres, gestion de boutiques, et catalogue de produits.

---

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture Logicielle](#architecture-logicielle)
- [Structure du Projet](#structure-du-projet)
- [Technologies Utilisées](#technologies-utilisées)
- [Modèles de Données](#modèles-de-données)
- [Système d'Authentification](#système-dauthentification)
- [Gestion des Rôles et Permissions](#gestion-des-rôles-et-permissions)
- [API Routes](#api-routes)
- [Fonctionnalités Principales](#fonctionnalités-principales)
- [Configuration et Déploiement](#configuration-et-déploiement)
- [Variables d'Environnement](#variables-denvironnement)
- [Commandes Disponibles](#commandes-disponibles)

---

## 🎯 Vue d'ensemble

Ce backend gère une plateforme de centres commerciaux avec trois types d'utilisateurs :

| Rôle | Description | Accès |
|------|-------------|-------|
| **Admin** | Gestionnaire du centre commercial | Accès complet à tous les espaces |
| **Boutique** | Commerçant locataire | Espace boutique + espace client |
| **Client** | Visiteur du centre commercial | Espace client uniquement |

### Fonctionnalités Clés

- ✅ Authentification JWT sécurisée avec 3 rôles
- ✅ Gestion des centres commerciaux, bâtiments, étages et emplacements
- ✅ Système d'appels d'offres pour l'attribution des boutiques
- ✅ Réponses aux appels d'offres avec création automatique de comptes boutique
- ✅ Gestion de catalogue produits par boutique
- ✅ Système de catégories hiérarchiques
- ✅ Logs d'audit pour le suivi des actions
- ✅ Envoi d'emails (nodemailer)
- ✅ Déploiement Vercel prêt

---

## 🏛️ Architecture Logicielle

L'architecture suit le pattern **Repository-Service-Controller** pour une séparation claire des responsabilités :

```
┌─────────────────────────────────────────────────────────────────┐
│                         REQUÊTE HTTP                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MIDDLEWARES                                │
│  • CORS • Body Parser • Authentification JWT • Vérification     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        ROUTES                                   │
│  /auth • /api/admin • /api/boutique • /api/client • /api/public │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CONTROLLERS                                │
│  Validation HTTP + Délégation aux Services                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVICES                                 │
│  Logique métier pure, indépendante de la base de données        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       REPOSITORIES                              │
│  Abstraction de l'accès aux données (MongoDB/Mongoose)          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         MODELS                                  │
│  Schémas Mongoose avec validation et middleware                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       MongoDB                                   │
│  Base de données NoSQL                                          │
└─────────────────────────────────────────────────────────────────┘
```

### Couches Détaillées

#### 1. **Middleware** (`/middleware`)
   - Intercepte les requêtes avant les routes
   - Authentification JWT
   - Vérification des rôles
   - Contrôle d'accès aux zones

#### 2. **Routes** (`/routes`)
   - Définition des endpoints API
   - Application des middlewares
   - Validation des données (express-validator)

#### 3. **Controllers** (`/controllers`)
   - Réception des requêtes HTTP
   - Validation des paramètres
   - Délégation aux services
   - Formatage des réponses

#### 4. **Services** (`/services`)
   - Logique métier pure
   - Orchestration des opérations
   - Validation métier
   - Indépendant de la couche HTTP

#### 5. **Repositories** (`/repositories`)
   - Abstraction de l'accès aux données
   - Opérations CRUD
   - Requêtes complexes
   - Isolation de la couche données

#### 6. **Models** (`/models`)
   - Schémas MongoDB
   - Validation des données
   - Hooks (pre-save, etc.)
   - Méthodes d'instance

---

## 📁 Structure du Projet

```
BACKEND/
├── index.js                          # Point d'entrée principal
├── package.json                      # Dépendances et scripts
├── .env                              # Variables d'environnement
├── vercel.json                       # Configuration Vercel
│
├── controllers/                      # Couche Contrôleurs
│   ├── AuthController.js             # Authentification
│   ├── admin/                        # Contrôleurs Admin
│   │   ├── AppelOffreController.js
│   │   ├── BatimentController.js
│   │   ├── BoutiqueController.js
│   │   ├── CentreController.js
│   │   ├── EmplacementController.js
│   │   ├── EtageController.js
│   │   ├── LogsController.js
│   │   └── ReponseAppelOffreController.js
│   └── boutique/                     # Contrôleurs Boutique
│       ├── CategorieController.js
│       └── ProduitController.js
│
├── services/                         # Couche Services (Logique métier)
│   ├── UtilisateurService.js         # Service utilisateurs
│   ├── EmailService.js               # Service d'envoi d'emails
│   ├── admin/                        # Services Admin
│   └── boutique/                     # Services Boutique
│
├── repositories/                     # Couche Repositories (Données)
│   ├── UtilisateurRepository.js      # Repository utilisateurs
│   ├── admin/                        # Repositories Admin
│   └── boutique/                     # Repositories Boutique
│
├── models/                           # Schémas MongoDB
│   ├── Utilisateur.js                # Modèle utilisateur
│   ├── admin/                        # Modèles Admin
│   │   ├── AppelOffre.js
│   │   ├── Batiment.js
│   │   ├── Boutique.js
│   │   ├── Centre.js
│   │   ├── Emplacement.js
│   │   ├── Etage.js
│   │   ├── Logs.js
│   │   └── ReponseAppelOffre.js
│   └── boutique/                     # Modèles Boutique
│       ├── Categorie.js
│       └── Produit.js
│
├── routes/                           # Définition des routes
│   ├── authRoutes.js                 # Routes d'authentification
│   ├── reponsesAppelOffre.js
│   ├── admin/                        # Routes Admin
│   │   ├── index.js                  # Routeur principal admin
│   │   ├── appelsOffre.js
│   │   ├── batiments.js
│   │   ├── boutiques.js
│   │   ├── centres.js
│   │   ├── emplacements.js
│   │   ├── etages.js
│   │   ├── logs.js
│   │   └── reponsesAppelOffre.js
│   ├── boutique/                     # Routes Boutique
│   │   ├── index.js
│   │   ├── categories.js
│   │   ├── produits.js
│   │   └── reponsesAppelOffre.js
│   └── client/                       # Routes Client
│       └── index.js
│
├── middleware/                       # Middlewares
│   └── auth.js                       # Authentification et autorisation
│
├── utils/                            # Utilitaires
│   ├── jwt.js                        # Fonctions JWT
│   └── validation.js                 # Validators express-validator
│
├── seed/                             # Scripts de seed (données initiales)
└── scripts/                          # Scripts utilitaires
```

---

## 🛠️ Technologies Utilisées

| Technologie | Version | Description |
|-------------|---------|-------------|
| **Node.js** | Latest | Runtime JavaScript |
| **Express** | ^5.2.1 | Framework web |
| **MongoDB** | - | Base de données NoSQL |
| **Mongoose** | ^9.1.3 | ODM MongoDB |
| **JWT** | ^9.0.3 | Authentification |
| **bcryptjs** | ^3.0.3 | Hashage des mots de passe |
| **express-validator** | ^7.3.1 | Validation des données |
| **cors** | ^2.8.5 | Gestion CORS |
| **dotenv** | ^17.2.3 | Variables d'environnement |
| **nodemailer** | ^6.9.5 | Envoi d'emails |
| **nodemon** | ^3.1.11 | Hot reload (dev) |

---

## 📊 Modèles de Données

### Hiérarchie des Entités

```
Centre Commercial
├── Bâtiment
│   └── Étage
│       └── Emplacement
│           └── Appel d'Offre
│               └── Réponse
│                   └── Boutique
│                       ├── Catégorie
│                       └── Produit
└── Utilisateurs (Admin, Boutique, Client)
```

### Modèles Principaux

#### 1. **Utilisateur** (`Utilisateur.js`)
```javascript
{
  email: String (unique, lowercase),
  mot_de_passe: String (hashé),
  prenom: String,
  nom: String,
  telephone: String,
  role: "admin" | "boutique" | "client",
  actif: Boolean,
  token_reinitialisation_mdp: String,
  expiration_reinitialisation_mdp: Date
}
```

#### 2. **Centre** (`Centre.js`)
```javascript
{
  nom: String,
  slug: String (unique),
  adresse: {
    rue, ville, code_postal, pays,
    coordonnees: GeoJSON Point
  },
  description: String,
  image_url: String,
  horaires_ouverture: Map<Jour, Horaire>,
  email_contact: String,
  telephone_contact: String
}
```

#### 3. **Bâtiment** (`Batiment.js`)
```javascript
{
  centre_id: ObjectId (ref: Centre),
  nom: String,
  description: String,
  nombre_etages: Number
}
```

#### 4. **Étage** (`Etage.js`)
```javascript
{
  batiment_id: ObjectId (ref: Bâtiment),
  nom: String,
  niveau: Number,
  surface_totale_m2: Number,
  hauteur_sous_plafond_m: Number
}
```

#### 5. **Emplacement** (`Emplacement.js`)
```javascript
{
  etage_id: ObjectId (ref: Étage),
  code: String,
  type: "box" | "kiosque" | "zone_loisirs" | "zone_commune" | "pop_up" | "autre",
  nom: String,
  surface_m2: Number,
  position: GeoJSON Polygon/Point,
  statut: "libre" | "occupe" | "reserve" | "en_travaux" | "en_negociation",
  loyer_mensuel: Number
}
```

#### 6. **Appel d'Offre** (`AppelOffre.js`)
```javascript
{
  emplacement_id: ObjectId (ref: Emplacement),
  date_appel: Date,
  description: String,
  statut: "ouvert" | "ferme" | "attribue"
}
```

#### 7. **Réponse Appel d'Offre** (`ReponseAppelOffre.js`)
```javascript
{
  appel_offre_id: ObjectId (ref: AppelOffre),
  boutique_id: ObjectId (ref: Boutique),
  utilisateur_id: ObjectId (ref: Utilisateur),
  montant_propose: Number,
  email_proposeur: String,
  message: String,
  statut: "propose" | "accepte" | "refuse"
}
```

#### 8. **Boutique** (`Boutique.js`)
```javascript
{
  appel_offre_id: ObjectId (ref: AppelOffre),
  contact: {
    nom, prenom, telephone, email, adresse
  },
  statut: "active" | "en_attente" | "fermee"
}
```

#### 9. **Catégorie** (`Categorie.js`)
```javascript
{
  idBoutique: ObjectId (ref: Boutique, nullable),
  nom: String,
  slug: String (unique),
  description: String,
  idCategorieParent: ObjectId (ref: Catégorie, nullable),
  urlImage: String,
  // Méthodes: buildCategoryTree(), getCategoriesWithHierarchy()
}
```

#### 10. **Produit** (`Produit.js`)
```javascript
{
  idBoutique: ObjectId (ref: Boutique),
  idCategorie: ObjectId (ref: Catégorie),
  nom: String,
  slug: String,
  description: String,
  prix: { devise, montant },
  stock: { quantite },
  images: [String],
  attributs: { couleur, taille[], marque },
  statut: "actif" | "rupture_stock" | "archive"
}
```

#### 11. **Logs** (`Logs.js`)
```javascript
{
  utilisateurId: String,
  action: "CREATE" | "UPDATE" | "DELETE",
  entite: String,
  entiteId: String,
  ancienneValeur: Mixed,
  nouvelleValeur: Mixed,
  dateHeure: Date,
  adresseIp: String,
  navigateur: String
}
```

---

## 🔐 Système d'Authentification

### Flux d'Inscription

```
1. POST /auth/inscription
   ↓
2. Validation des données (express-validator)
   ↓
3. AuthController.inscription()
   ↓
4. UtilisateurService.inscrire()
   - Nettoyage des données
   - Vérification unicité email
   ↓
5. UtilisateurRepository.creer()
   - Hashage automatique du mot de passe (pre-save hook)
   ↓
6. Génération token JWT
   ↓
7. Retour: { token, utilisateur }
```

### Flux de Connexion

```
1. POST /auth/connexion
   ↓
2. Validation email + mot de passe
   ↓
3. AuthController.connexion()
   ↓
4. UtilisateurService.connecter()
   - Recherche utilisateur
   - Vérification mot de passe (bcrypt.compare)
   - Vérification statut actif
   ↓
5. Génération token JWT
   ↓
6. Retour: { token, utilisateur }
```

### Token JWT

```javascript
// Structure du token
{
  id: "utilisateur_id",
  iat: timestamp,
  exp: timestamp + 24h
}

// Configuration
JWT_SECRET: "votre_secret"
JWT_EXPIRE: "24h"
```

---

## 👥 Gestion des Rôles et Permissions

### Hiérarchie des Rôles

```
┌──────────────────────────────────────────────────────────┐
│                      ADMIN                               │
│  • Accès complet à tous les espaces                      │
│  • Gestion des centres, bâtiments, emplacements          │
│  • Gestion des appels d'offres                           │
│  • Validation des réponses                               │
│  • Création des boutiques                                │
│  • Gestion des utilisateurs                              │
└──────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────────┐                  ┌──────────────────┐
│     BOUTIQUE     │                  │      CLIENT      │
│  • Espace client │                  │  • Espace client │
│  • Espace boutique│                 │  • Voir appels   │
│  • Gérer produits│                  │    d'offre       │
│  • Gérer catégories              │  • Soumettre       │
│  • Répondre aux appels           │    réponses        │
└──────────────────┘                  └──────────────────┘
```

### Middleware d'Autorisation

```javascript
// middleware/auth.js

// 1. Authentification
authentification(req, res, next)
// → Vérifie le token JWT
// → Charge l'utilisateur
// → Vérifie le statut actif

// 2. Vérification de rôle
verifierRole("admin", "boutique")(req, res, next)
// → Vérifie que l'utilisateur a l'un des rôles

// 3. Vérification de propriété
verifierProprietaire(req, res, next)
// → Vérifie que l'utilisateur accède à ses données

// 4. Contrôle d'accès par zone
interdireAccesInterdit(req, res, next)
// → Client: uniquement /client
// → Boutique: /boutique + /client (pas /admin)
// → Admin: accès complet
```

### Matrice des Permissions

| Endpoint | Admin | Boutique | Client |
|----------|-------|----------|--------|
| `/auth/*` | ✅ | ✅ | ✅ |
| `/api/admin/*` | ✅ | ❌ | ❌ |
| `/api/boutique/*` | ✅ | ✅ | ❌ |
| `/api/client/*` | ✅ | ✅ | ✅ |
| `/api/public/*` | ✅ | ✅ | ✅ |

---

## 🛣️ API Routes

### Authentification (`/auth`)

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| POST | `/inscription` | Créer un compte | ❌ | Public |
| POST | `/connexion` | Se connecter | ❌ | Public |
| GET | `/profil` | Voir son profil | ✅ | Tous |
| PUT | `/profil` | Modifier profil | ✅ | Tous |
| PUT | `/changer-mot-de-passe` | Changer MDP | ✅ | Tous |
| POST | `/demander-reinitialisation` | Demander reset MDP | ❌ | Public |
| POST | `/reinitialiser-mot-de-passe` | Reset avec token | ❌ | Public |
| GET | `/utilisateurs` | Liste utilisateurs | ✅ | Admin |
| PUT | `/utilisateurs/:id/statut` | Activer/Désactiver | ✅ | Admin |

### Administration (`/api/admin`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| **Centres** |
| GET | `/centres` | Liste des centres |
| POST | `/centres` | Créer un centre |
| GET | `/centres/:id` | Détails d'un centre |
| PUT | `/centres/:id` | Modifier un centre |
| DELETE | `/centres/:id` | Supprimer un centre |
| **Bâtiments** |
| GET | `/batiments` | Liste des bâtiments |
| POST | `/batiments` | Créer un bâtiment |
| GET | `/batiments/:id` | Détails d'un bâtiment |
| PUT | `/batiments/:id` | Modifier un bâtiment |
| DELETE | `/batiments/:id` | Supprimer un bâtiment |
| **Étages** |
| GET | `/etages` | Liste des étages |
| POST | `/etages` | Créer un étage |
| GET | `/etages/:id` | Détails d'un étage |
| PUT | `/etages/:id` | Modifier un étage |
| DELETE | `/etages/:id` | Supprimer un étage |
| **Emplacements** |
| GET | `/emplacements` | Liste des emplacements |
| POST | `/emplacements` | Créer un emplacement |
| GET | `/emplacements/:id` | Détails d'un emplacement |
| PUT | `/emplacements/:id` | Modifier un emplacement |
| DELETE | `/emplacements/:id` | Supprimer un emplacement |
| **Appels d'Offre** |
| GET | `/appels-offre` | Liste des appels d'offre |
| POST | `/appels-offre` | Créer un appel d'offre |
| GET | `/appels-offre/:id` | Détails d'un appel d'offre |
| PUT | `/appels-offre/:id` | Modifier un appel d'offre |
| DELETE | `/appels-offre/:id` | Supprimer un appel d'offre |
| **Boutiques** |
| GET | `/boutiques` | Liste des boutiques |
| POST | `/boutiques` | Créer une boutique |
| GET | `/boutiques/:id` | Détails d'une boutique |
| PUT | `/boutiques/:id` | Modifier une boutique |
| DELETE | `/boutiques/:id` | Supprimer une boutique |
| **Réponses Appels d'Offre** |
| GET | `/reponses-appel-offre` | Liste des réponses |
| POST | `/reponses-appel-offre` | Créer une réponse |
| PUT | `/reponses-appel-offre/:id` | Modifier une réponse |
| DELETE | `/reponses-appel-offre/:id` | Supprimer une réponse |
| **Logs** |
| GET | `/logs` | Historique des actions |

### Boutique (`/api/boutique`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| **Catégories** |
| GET | `/categories` | Liste des catégories |
| POST | `/categories` | Créer une catégorie |
| GET | `/categories/:id` | Détails d'une catégorie |
| PUT | `/categories/:id` | Modifier une catégorie |
| DELETE | `/categories/:id` | Supprimer une catégorie |
| GET | `/categories/tree` | Arbre des catégories |
| **Produits** |
| GET | `/produits` | Liste des produits |
| POST | `/produits` | Créer un produit |
| GET | `/produits/:id` | Détails d'un produit |
| PUT | `/produits/:id` | Modifier un produit |
| DELETE | `/produits/:id` | Supprimer un produit |
| **Réponses Appels d'Offre** |
| POST | `/reponses-appel-offre` | Soumettre une réponse |
| GET | `/reponses-appel-offre/mes-reponses` | Mes réponses |

### Client (`/api/client`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Accueil client (test d'accès) |

### Public (`/api/public`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/centres` | Liste des centres | ❌ |
| GET | `/centres/:id/plan` | Plan d'un centre | ❌ |
| GET | `/appels-offre` | Appels d'offre ouverts (paginé) | ❌ |
| GET | `/appels-offre/:id` | Détails d'un appel d'offre | ❌ |

---

## ⚙️ Fonctionnalités Principales

### 1. Gestion des Centres Commerciaux

- Création de centres avec adresse et coordonnées GPS
- Gestion multi-bâtiments
- Gestion des étages par bâtiment
- Définition des emplacements (box, kiosques, zones loisirs)
- Positionnement géographique des emplacements (GeoJSON)

### 2. Système d'Appels d'Offres

```
1. Admin crée un appel d'offre pour un emplacement
2. L'appel est publié sur /api/public/appels-offre
3. Les utilisateurs soumettent des réponses avec:
   - Montant proposé
   - Message de motivation
4. Admin examine les réponses
5. Admin attribue l'appel d'offre
6. Création automatique de la boutique
7. Envoi des identifiants par email au gagnant
```

### 3. Gestion des Boutiques

- Création automatique après attribution d'appel d'offre
- Ouverture de session dédiée pour les boutiques
- Gestion du profil et des coordonnées

### 4. Catalogue Produits

- Catégories hiérarchiques (arbre récursif)
- Produits avec variantes (couleur, taille, marque)
- Gestion des stocks
- Statuts (actif, rupture, archive)
- Images multiples

### 5. Système de Logs

- Tracking de toutes les actions CRUD
- Enregistrement des anciennes et nouvelles valeurs
- Adresse IP et navigateur
- Consultable par les admins

### 6. Emails Transactionnels

- Bienvenue
- Identifiants de connexion
- Réinitialisation de mot de passe
- Notification de changement de mot de passe

---

## 🚀 Configuration et Déploiement

### Installation Locale

```bash
# 1. Cloner le repository
git clone <repository-url>
cd BACKEND

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 4. Démarrer en développement
npm run dev

# 5. Démarrer en production
npm start
```

### Déploiement Vercel

Le projet est configuré pour Vercel :

```json
// vercel.json
{
  "version": 2,
  "builds": [{ "src": "index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "index.js" }],
  "env": { "NODE_ENV": "production" }
}
```

**Important :** Le serveur n'écoute pas en production, Vercel gère le routing.

```javascript
// index.js
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
}
module.exports = app; // Export pour Vercel
```

---

## 🔧 Variables d'Environnement

### Fichier `.env`

```bash
# MongoDB
MONGO_URI=mongodb://localhost:27017/mean_db
# Ou MongoDB Atlas:
# MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# JWT
JWT_SECRET=votre_secret_tres_securise
JWT_EXPIRE=24h

# Serveur
PORT=5000
NODE_ENV=development

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_app
EMAIL_FROM=no-reply@votredomaine.com
BOUTIQUE_EMAIL_DOMAIN=votredomaine.com
```

---

## 📝 Commandes Disponibles

```bash
# Développement avec hot-reload
npm run dev

# Production
npm start

# Tests (à implémenter)
npm test
```

---

## 📌 Points Importants

### Sécurité

- ✅ Mots de passe hashés avec bcrypt (12 rounds)
- ✅ Tokens JWT signés
- ✅ Validation des données avec express-validator
- ✅ Protection contre les mots de passe faibles
- ✅ Vérification des rôles et permissions
- ✅ Tokens de réinitialisation avec expiration

### Performance

- ✅ Index MongoDB sur les champs fréquemment queryés
- ✅ Pagination des listes
- ✅ Projection des champs (select)
- ✅ Lean queries pour les lectures

### Bonnes Pratiques

- ✅ Séparation des responsabilités (Controller/Service/Repository)
- ✅ Validation des données à chaque couche
- ✅ Gestion centralisée des erreurs
- ✅ Logs d'audit
- ✅ Code commenté et documenté

---

## 📞 Support

Pour toute question ou problème, consultez la documentation ou contactez l'équipe de développement.

---

**Développé avec ❤️ en Node.js + Express + MongoDB**
