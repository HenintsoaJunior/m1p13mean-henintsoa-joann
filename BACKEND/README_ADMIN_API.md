# API Admin - Documentation

## 🔐 Authentification

**IMPORTANT**: Toutes les routes de l'API Admin nécessitent une authentification JWT avec un rôle **admin**.

### Comment s'authentifier :

1. **Connectez-vous** avec un compte admin via `/api/auth/login`
2. **Récupérez le token JWT** retourné dans la réponse
3. **Ajoutez le token** dans le header `Authorization: Bearer {token}` pour toutes les requêtes

### Exemple avec curl :
```bash
# 1. Se connecter
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","mot_de_passe":"Admin123!"}'

# 2. Utiliser le token pour accéder à l'API Admin
curl -X GET http://localhost:3000/api/admin/centres \
  -H "Authorization: Bearer {votre_token_jwt}"
```

## Structure des dossiers

```
BACKEND/
├── models/admin/
│   ├── Logs.js
│   ├── Centre.js
│   ├── Batiment.js
│   ├── Etage.js
│   ├── Emplacement.js
│   ├── AppelOffre.js
│   └── Boutique.js
├── repositories/admin/
│   ├── LogsRepository.js
│   ├── CentreRepository.js
│   ├── BatimentRepository.js
│   ├── EtageRepository.js
│   ├── EmplacementRepository.js
│   ├── AppelOffreRepository.js
│   └── BoutiqueRepository.js
├── services/admin/
│   ├── LogsService.js
│   ├── CentreService.js
│   ├── BatimentService.js
│   ├── EtageService.js
│   ├── EmplacementService.js
│   ├── AppelOffreService.js
│   └── BoutiqueService.js
├── controllers/admin/
│   ├── LogsController.js
│   ├── CentreController.js
│   ├── BatimentController.js
│   ├── EtageController.js
│   ├── EmplacementController.js
│   ├── AppelOffreController.js
│   └── BoutiqueController.js
└── routes/admin/
    ├── index.js
    ├── logs.js
    ├── centres.js
    ├── batiments.js
    ├── etages.js
    ├── emplacements.js
    ├── appelsOffre.js
    └── boutiques.js
```

## Configuration

Pour utiliser les routes admin, ajoutez dans votre fichier `server.js` ou `index.js`:

```javascript
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);
```

## Collections disponibles

### 1. Logs
- **POST** `/api/admin/logs` - Créer un log
- **GET** `/api/admin/logs` - Liste tous les logs
- **GET** `/api/admin/logs/:id` - Obtenir un log par ID
- **GET** `/api/admin/logs/utilisateur/:utilisateurId` - Logs d'un utilisateur
- **DELETE** `/api/admin/logs/:id` - Supprimer un log

### 2. Centres
- **POST** `/api/admin/centres` - Créer un centre
- **GET** `/api/admin/centres` - Liste tous les centres
- **GET** `/api/admin/centres/:id` - Obtenir un centre par ID
- **GET** `/api/admin/centres/slug/:slug` - Obtenir un centre par slug
- **GET** `/api/admin/centres/near?longitude=X&latitude=Y&maxDistance=Z` - Centres à proximité
- **PUT** `/api/admin/centres/:id` - Modifier un centre
- **DELETE** `/api/admin/centres/:id` - Supprimer un centre

### 3. Bâtiments
- **POST** `/api/admin/batiments` - Créer un bâtiment
- **GET** `/api/admin/batiments` - Liste tous les bâtiments
- **GET** `/api/admin/batiments/:id` - Obtenir un bâtiment par ID
- **GET** `/api/admin/batiments/centre/:centreId` - Bâtiments d'un centre
- **PUT** `/api/admin/batiments/:id` - Modifier un bâtiment
- **DELETE** `/api/admin/batiments/:id` - Supprimer un bâtiment

### 4. Étages
- **POST** `/api/admin/etages` - Créer un étage
- **GET** `/api/admin/etages` - Liste tous les étages
- **GET** `/api/admin/etages/:id` - Obtenir un étage par ID
- **GET** `/api/admin/etages/batiment/:batimentId` - Étages d'un bâtiment
- **PUT** `/api/admin/etages/:id` - Modifier un étage
- **DELETE** `/api/admin/etages/:id` - Supprimer un étage

### 5. Emplacements
- **POST** `/api/admin/emplacements` - Créer un emplacement
- **GET** `/api/admin/emplacements` - Liste tous les emplacements
- **GET** `/api/admin/emplacements/:id` - Obtenir un emplacement par ID
- **GET** `/api/admin/emplacements/etage/:etageId` - Emplacements d'un étage
- **GET** `/api/admin/emplacements/statut/:statut` - Emplacements par statut
- **PUT** `/api/admin/emplacements/:id` - Modifier un emplacement
- **DELETE** `/api/admin/emplacements/:id` - Supprimer un emplacement

### 6. Appels d'Offre
- **POST** `/api/admin/appels-offre` - Créer un appel d'offre
- **GET** `/api/admin/appels-offre` - Liste tous les appels d'offre
- **GET** `/api/admin/appels-offre/:id` - Obtenir un appel d'offre par ID
- **GET** `/api/admin/appels-offre/emplacement/:emplacementId` - Appels d'un emplacement
- **GET** `/api/admin/appels-offre/statut/:statut` - Appels par statut
- **PUT** `/api/admin/appels-offre/:id` - Modifier un appel d'offre
- **DELETE** `/api/admin/appels-offre/:id` - Supprimer un appel d'offre

### 7. Boutiques
- **POST** `/api/admin/boutiques` - Créer une boutique
- **GET** `/api/admin/boutiques` - Liste toutes les boutiques
- **GET** `/api/admin/boutiques/:id` - Obtenir une boutique par ID
- **GET** `/api/admin/boutiques/appel-offre/:appelOffreId` - Boutiques d'un appel d'offre
- **GET** `/api/admin/boutiques/statut/:statut` - Boutiques par statut
- **PUT** `/api/admin/boutiques/:id` - Modifier une boutique
- **DELETE** `/api/admin/boutiques/:id` - Supprimer une boutique

## Pagination

Toutes les routes GET supportent la pagination via les paramètres:
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre d'éléments par page (défaut: 10)

Exemple: `/api/admin/centres?page=2&limit=20`

## Postman Collection

Un fichier `postman_collection_admin.json` est fourni avec toutes les requêtes pré-configurées et l'authentification Bearer Token.

### Import dans Postman:
1. Ouvrir Postman
2. Cliquer sur "Import"
3. Sélectionner le fichier `postman_collection_admin.json`
4. La collection sera importée avec l'authentification Bearer Token configurée

### 🚀 Utilisation de la collection Postman:

#### Étape 1: Se connecter (OBLIGATOIRE)
1. Ouvrez la section **🔐 Auth**
2. Exécutez la requête **Login Admin**
3. Le token JWT sera **automatiquement enregistré** dans les variables de la collection
4. Toutes les autres requêtes utiliseront automatiquement ce token

#### Étape 2: Tester les endpoints
- Le Bearer Token est configuré au niveau de la collection
- Toutes les requêtes hériteront automatiquement de l'authentification
- Les ID créés sont automatiquement enregistrés dans les variables

### Variables Postman configurées automatiquement:
- `baseUrl` : URL de base de l'API (http://localhost:3000/api/admin)
- `authUrl` : URL d'authentification (http://localhost:3000/api/auth)
- `token` : **Token JWT (auto-configuré après login)**
- `utilisateur_id` : ID de l'utilisateur connecté (auto-configuré)
- `centre_id` : ID du centre créé (auto-configuré)
- `batiment_id` : ID du bâtiment créé (auto-configuré)
- `etage_id` : ID de l'étage créé (auto-configuré)
- `emplacement_id` : ID de l'emplacement créé (auto-configuré)
- `appel_offre_id` : ID de l'appel d'offre créé (auto-configuré)
- `boutique_id` : ID de la boutique créée (auto-configuré)

### ⚠️ Note importante:
**Modifiez les identifiants dans la requête "Login Admin"** avec vos propres credentials admin avant de lancer la collection.

## Statuts disponibles

### Emplacement
- `libre`
- `occupe`
- `reserve`
- `en_travaux`
- `en_negociation`

### AppelOffre
- `ouvert`
- `ferme`
- `attribue`

### Boutique
- `active`
- `en_attente`
- `fermee`

## Types d'emplacement
- `box`
- `kiosque`
- `zone_loisirs`
- `zone_commune`
- `pop_up`
- `autre`
