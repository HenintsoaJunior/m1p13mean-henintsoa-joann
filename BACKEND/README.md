# TP1 Production Backend

API REST Backend développée avec Node.js, Express et MongoDB pour la gestion d'articles.

## 🚀 Technologies

- **Node.js** - Environnement d'exécution JavaScript
- **Express** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **CORS** - Gestion des requêtes cross-origin

## 📋 Prérequis

- Node.js (v14 ou supérieur)
- MongoDB installé localement ou accès à MongoDB Atlas
- npm ou yarn

## 🔧 Installation

1. Cloner le repository

```bash
git clone <url-du-repo>
cd TP1_PROD_BACKEND
```

2. Installer les dépendances

```bash
npm install
```

3. Configurer les variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mean_db
```

## 🎯 Démarrage

### Mode développement (avec hot-reload)

```bash
npm run dev
```

### Mode production

```bash
npm start
```

Le serveur démarre sur `http://localhost:5000`

## 📡 API Endpoints

### Articles

- `GET /articles` - Récupérer tous les articles
- `GET /articles/:id` - Récupérer un article par ID
- `POST /articles` - Créer un nouvel article
- `PUT /articles/:id` - Mettre à jour un article
- `DELETE /articles/:id` - Supprimer un article

## 🗄️ Base de données

### Production (MongoDB Atlas)

```bash
mongosh "mongodb+srv://rakotoarimananahentsa_db_user:br1raWEemIL5FjiU@cluster0.w8vbhw2.mongodb.net/mean_db?retryWrites=true&w=majority"
```

### Local

```bash
mongosh "mongodb://localhost:27017/mean_db"
```

## 📁 Structure du projet

```
TP1_PROD_BACKEND/
├── models/
│   └── Article.js       # Schéma Mongoose pour Article
├── routes/
│   └── articleRoutes.js # Routes API pour les articles
├── server.js            # Point d'entrée de l'application
├── package.json
├── .env                 # Variables d'environnement (à créer)
└── README.md
```

## 🔐 Sécurité

⚠️ **Important** : Ne jamais commiter le fichier `.env` contenant les credentials de production. Assurez-vous qu'il est bien dans `.gitignore`.

## 📝 License

ISC
