# Template Angular 21 - Administration Simple

Template Angular moderne (Angular 21+) pour espace d'administration uniquement.
Design sobre, thème clair, style classique sans animations ni effets.

## ✨ Caractéristiques

- **Framework** : Angular 21+ avec Standalone Components
- **Style** : SCSS sobre, thème clair, sans animations
- **Responsive** : Mobile-first, layout adaptatif
- **Profil unique** : Administration seulement

## 🏗️ Structure du projet

```
src/app/
├── shared/                    # Composants partagés
│   └── components/
│       ├── navbar/           # Navigation principale
│       ├── footer/           # Pied de page
│       ├── card/             # Cartes d'information
│       ├── table/            # Tableaux de données
│       ├── modal/            # Fenêtres modales
│       └── loader/           # Indicateur de chargement
│
├── layouts/
│   └── admin-layout/         # Layout administration
│
├── admin/                     # Espace administration
│   └── components/
│       ├── sidebar/          # Menu latéral admin
│       └── dashboard/        # Tableau de bord admin
│
├── pages/
│   └── login/               # Page de connexion
│
├── app.component.ts         # Composant racine
└── app.routes.ts           # Configuration des routes
```

## 🎨 Design System

### Palette de couleurs
- **Fond principal** : `#ffffff` / `#f8f8f8`
- **Texte** : `#000000` / `#333333`
- **Bordures** : `#cccccc`
- **Accent** : `#e6f3ff`

### Principles de design
- ❌ Aucune animation ni transition
- ❌ Aucun border-radius ni shadow
- ❌ Aucun effet hover animé
- ✅ Design plat, carré, sobre
- ✅ Lisibilité maximale
- ✅ Style administratif classique

## 📱 Responsive

- **Mobile** : `max-width: 768px`
  - Sidebar transformée en menu horizontal
  - Cards empilées verticalement
  - Tableaux avec scroll horizontal

- **Tablette** : `769px - 1024px`
  - Sidebar réduite (200px)
  - Cards sur 2 colonnes

- **Desktop** : `1025px+`
  - Layout complet
  - Cards sur 3 colonnes

## 🚀 Routes

- `/` → Redirection vers `/login`
- `/login` → Page de connexion
- `/admin/dashboard` → Tableau de bord administration

## 📦 Composants

### Partagés
- **Navbar** : Navigation responsive avec menu hamburger
- **Footer** : Pied de page avec liens utiles
- **Card** : Conteneur d'information avec titre/contenu/footer
- **Table** : Tableau de données avec tri et actions
- **Modal** : Fenêtre modale simple
- **Loader** : Indicateur de chargement textuel

### Administration
- **Layout** : Structure globale avec sidebar
- **Sidebar** : Menu de navigation admin (Dashboard, Utilisateurs, Boutiques, Rapports, Paramètres)
- **Dashboard** : Vue d'ensemble avec statistiques et tableaux

## 💻 Utilisation

### Démarrage
```bash
npm start
```

### Navigation
1. Accéder à `http://localhost:4200`
2. Page de login avec accès direct à l'administration
3. Interface complète d'administration

### Développement
- Tous les composants sont **standalone** (pas de NgModule)
- Styles SCSS modulaires et responsive
- Code commenté et organisé
- Structure évolutive pour ajouts futurs

## 🔧 Configuration

### Styles globaux
Les styles de base sont dans `src/styles.css` avec :
- Variables CSS et styles de base
- Media queries et responsive

### Composants standalone
Tous les composants utilisent `standalone: true` et importent uniquement leurs dépendances.

---

**Note** : Cette template est uniquement UI - aucune logique métier, authentification, ou API n'est implémentée.