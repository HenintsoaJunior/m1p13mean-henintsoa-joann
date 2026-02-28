# 🎨 Architecture Frontend - Angular 21

Application frontend complète pour la gestion de centres commerciaux, développée avec **Angular 21** et **TypeScript**.

---

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture Logicielle](#architecture-logicielle)
- [Structure du Projet](#structure-du-projet)
- [Technologies Utilisées](#technologies-utilisées)
- [Routing et Navigation](#routing-et-navigation)
- [Système d'Authentification](#système-dauthentification)
- [Guards et Sécurité](#guards-et-sécurité)
- [Interceptors HTTP](#interceptors-http)
- [Services Principaux](#services-principaux)
- [Composants par Espace](#composants-par-espace)
- [Gestion des États](#gestion-des-états)
- [Communication avec le Backend](#communication-avec-le-backend)
- [Configuration et Déploiement](#configuration-et-déploiement)
- [Commandes Disponibles](#commandes-disponibles)

---

## 🎯 Vue d'ensemble

Application Angular monopage (SPA) avec 3 espaces utilisateurs distincts :

| Espace | Description | Routes |
|--------|-------------|--------|
| **Admin** | Gestion complète du centre commercial | `/admin/*` |
| **Boutique** | Gestion des produits et catégories | `/boutique/*` |
| **Client** | Consultation des appels d'offres | `/client/*` |

### Fonctionnalités Clés

- ✅ Authentification JWT avec guards de sécurité
- ✅ 3 layouts distincts (Admin, Boutique, Client)
- ✅ Routing modulaire avec lazy loading
- ✅ Interceptors HTTP pour token et erreurs
- ✅ Services réutilisables avec RxJS
- ✅ Composants réutilisables (Shared)
- ✅ Gestion des environnements (dev/prod)
- ✅ Déploiement Vercel configuré
- ✅ TailwindCSS pour le styling

---

## 🏛️ Architecture Logicielle

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVIGATEUR                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Angular Application                          │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  Components │  │   Guards    │  │    Interceptors         │ │
│  │  (UI Layer) │  │  (Security) │  │  (HTTP Middleware)      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│         │                │                      │               │
│         └────────────────┴──────────────────────┘               │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                      Services                             │ │
│  │  (Auth, API, Toast, Logs, Sidebar, Breadcrumb)            │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                   HttpClient                              │ │
│  │              (Requêtes API REST)                          │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API (Express)                        │
│                  http://localhost:5000                          │
└─────────────────────────────────────────────────────────────────┘
```

### Pattern Architectural

L'application suit une architecture **modulaire** avec séparation des responsabilités :

```
┌─────────────────────────────────────────────────────────┐
│                    Layouts (3)                          │
│  • AdminLayoutComponent    • BoutiqueLayoutComponent    │
│  • ClientLayoutComponent                                │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│    Admin     │ │   Boutique   │ │    Client    │
│  Components  │ │  Components  │ │  Components  │
│              │ │              │ │              │
│ • Dashboard  │ │ • Dashboard  │ │ • Home       │
│ • Centres    │ │ • Produits   │ │ • Appels    │
│ • Utilisateurs│ │ • Catégories │ │   d'offre   │
│ • Appels     │ │ • Appels     │ │              │
│ • Logs       │ │              │ │              │
│ • Plan       │ │              │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Shared Module                          │
│  • Components: Modal, Loader, Toast, Table, Card...     │
│  • Guards: authGuard, roleGuard, adminGuard...          │
│  • Interceptors: authInterceptor, errorInterceptor...   │
│  • Services: BreadcrumbService, CentreService...        │
│  • Interfaces: Auth, Centre, etc.                       │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Structure du Projet

```
FRONTEND/
├── src/
│   ├── app/
│   │   ├── admin/                          # Espace Administrateur
│   │   │   └── components/
│   │   │       ├── activity-history/       # Historique des activités
│   │   │       │   ├── activity-history.component.ts
│   │   │       │   ├── activity-history.component.html
│   │   │       │   └── activity-history.component.scss
│   │   │       ├── appels-offre/           # Gestion des appels d'offre
│   │   │       │   ├── pages/
│   │   │       │   │   ├── appels-offre-list/
│   │   │       │   │   └── reponses/
│   │   │       │   └── services/
│   │   │       │       ├── appels-offre.service.ts
│   │   │       │       └── reponses.service.ts
│   │   │       ├── centres/                # Gestion des centres
│   │   │       │   ├── components/
│   │   │       │   │   └── breadcrumb/
│   │   │       │   ├── pages/
│   │   │       │   │   ├── centres-list/
│   │   │       │   │   ├── centre-crud/
│   │   │       │   │   ├── batiments-crud/
│   │   │       │   │   ├── etages-crud/
│   │   │       │   │   └── emplacements-crud/
│   │   │       │   └── services/
│   │   │       │       └── centres.service.ts
│   │   │       ├── dashboard/              # Dashboard admin
│   │   │       │   └── admin-dashboard.component.*
│   │   │       ├── logs/                   # Logs système
│   │   │       │   └── services/
│   │   │       │       └── logs.service.ts
│   │   │       ├── plan-centre/            # Visualisation plan
│   │   │       │   └── plan-centre.ts/html/css
│   │   │       ├── sidebar/                # Sidebar admin
│   │   │       │   └── admin-sidebar.component.*
│   │   │       └── utilisateurs/           # Gestion utilisateurs
│   │   │           ├── pages/
│   │   │           │   └── list-utilisateur/
│   │   │           └── services/
│   │   │               └── utilisateur.service.ts
│   │   │
│   │   ├── boutique/                       # Espace Boutique
│   │   │   ├── components/
│   │   │   │   ├── categories/             # Gestion catégories
│   │   │   │   │   ├── models/
│   │   │   │   │   │   └── boutique.models.ts
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── categorie-list/
│   │   │   │   │   └── services/
│   │   │   │   │       └── categorie.service.ts
│   │   │   │   ├── produits/               # Gestion produits
│   │   │   │   │   ├── models/
│   │   │   │   │   │   └── boutique.models.ts
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   ├── produit-list/
│   │   │   │   │   │   ├── produit-create/
│   │   │   │   │   │   └── produit-edit/
│   │   │   │   │   └── services/
│   │   │   │   │       └── produit.service.ts
│   │   │   │   └── sidebar/                # Sidebar boutique
│   │   │   │       └── boutique-sidebar.component.*
│   │   │   └── pages/
│   │   │       └── dashboard/
│   │   │           └── boutique-dashboard.component.*
│   │   │
│   │   ├── client/                         # Espace Client
│   │   │   ├── components/
│   │   │   │   ├── appels-offre/           # Consultation appels
│   │   │   │   │   ├── appels-offre-client.component.*
│   │   │   │   │   └── response-form-client.component.*
│   │   │   │   └── home/                   # Accueil client
│   │   │   │       └── home.component.*
│   │   │   └── services/
│   │   │       └── appels-offre.service.ts
│   │   │
│   │   ├── layouts/                        # Layouts principaux
│   │   │   ├── admin-layout/
│   │   │   │   ├── admin-layout.component.ts
│   │   │   │   ├── admin-layout.component.html
│   │   │   │   └── admin-layout.component.scss
│   │   │   ├── boutique-layout/
│   │   │   │   ├── boutique-layout.component.*
│   │   │   │   └── ...
│   │   │   └── client-layout/
│   │   │       └── client-layout.component.*
│   │   │
│   │   ├── pages/                          # Pages publiques
│   │   │   ├── admin-login/                # Connexion admin
│   │   │   ├── boutique-login/             # Connexion boutique
│   │   │   ├── client-login/               # Connexion client
│   │   │   ├── client-register/            # Inscription client
│   │   │   └── landing/                    # Page d'accueil
│   │   │
│   │   ├── services/                       # Services globaux
│   │   │   ├── auth.service.ts             # Authentification
│   │   │   ├── log.service.ts              # Gestion des logs
│   │   │   ├── sidebar.service.ts          # Gestion sidebar
│   │   │   └── toast.service.ts            # Notifications
│   │   │
│   │   ├── shared/                         # Module partagé
│   │   │   ├── components/                 # Composants réutilisables
│   │   │   │   ├── breadcrumb/
│   │   │   │   ├── card/
│   │   │   │   ├── demo-form/
│   │   │   │   ├── footer/
│   │   │   │   ├── form/
│   │   │   │   ├── loader/
│   │   │   │   ├── modal/
│   │   │   │   ├── navbar/
│   │   │   │   ├── table/
│   │   │   │   └── toast/
│   │   │   ├── guards/                     # Guards de sécurité
│   │   │   │   ├── admin.guard.ts
│   │   │   │   ├── auth.guard.ts
│   │   │   │   ├── guest.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── interceptors/               # Interceptors HTTP
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   ├── error.interceptor.ts
│   │   │   │   └── logging.interceptor.ts
│   │   │   ├── interfaces/                 # Interfaces TypeScript
│   │   │   │   ├── auth.interface.ts
│   │   │   │   └── centre.interface.ts
│   │   │   └── services/                   # Services partagés
│   │   │       ├── breadcrumb.service.ts
│   │   │       └── centre.service.ts
│   │   │
│   │   ├── app.routes.ts                   # Configuration des routes
│   │   ├── app.config.ts                   # Configuration de l'app
│   │   ├── app.ts                          # Composant racine
│   │   └── main.ts                         # Point d'entrée
│   │
│   ├── assets/                             # Ressources statiques
│   │   └── styles/
│   │       ├── base.scss
│   │       └── responsive.scss
│   │
│   ├── environments/                       # Variables d'environnement
│   │   ├── environment.ts                  # Développement
│   │   └── environment.prod.ts             # Production
│   │
│   ├── styles/                             # Styles globaux
│   │   ├── components.css
│   │   └── variables.css
│   │
│   ├── index.html                          # Template HTML principal
│   └── main.ts                             # Bootstrap de l'application
│
├── public/                                 # Fichiers publics
├── dist/                                   # Build de production
├── angular.json                            # Configuration Angular
├── package.json                            # Dépendances et scripts
├── tsconfig.json                           # Configuration TypeScript
├── tsconfig.app.json                       # Config TypeScript pour l'app
├── vercel.json                             # Configuration Vercel
└── .vercelignore                           # Fichiers ignorés par Vercel
```

---

## 🛠️ Technologies Utilisées

| Technologie | Version | Description |
|-------------|---------|-------------|
| **Angular** | ^21.0.0 | Framework frontend |
| **TypeScript** | ~5.9.2 | Langage typé |
| **RxJS** | ~7.8.0 | Programmation réactive |
| **TailwindCSS** | ^4.1.12 | Framework CSS utilitaire |
| **PostCSS** | ^8.5.3 | Transformation CSS |
| **Zone.js** | ^0.16.0 | Gestion du change detection |

### Outils de Développement

| Outil | Version | Description |
|-------|---------|-------------|
| **@angular/cli** | ^21.0.5 | CLI Angular |
| **@angular/build** | ^21.0.0 | Builder Angular |
| **Vitest** | ^4.0.8 | Framework de tests |
| **jsdom** | - | DOM simulé pour tests |

---

## 🗺️ Routing et Navigation

### Configuration des Routes (`app.routes.ts`)

```typescript
// Routes publiques
{ path: '', component: LandingComponent }
{ path: 'login', component: AdminLoginComponent, canActivate: [guestGuard] }
{ path: 'client-login', component: ClientLoginComponent }
{ path: 'client-register', component: ClientRegisterComponent }
{ path: 'boutique-login', component: BoutiqueLoginComponent }

// Espace Admin (protégé)
{
  path: 'admin',
  component: AdminLayoutComponent,
  canActivate: [authGuard, roleGuard(['admin'])],
  children: [
    { path: 'dashboard', component: AdminDashboardComponent },
    { path: 'plan-centre', component: PlanCentreComponent },
    { path: 'centres', component: CentresListComponent },
    { path: 'centres/centres-crud', component: CentreCrudComponent },
    { path: 'centres/batiments-crud', component: BatimentsCrudComponent },
    { path: 'centres/etages-crud', component: EtagesCrudComponent },
    { path: 'centres/emplacements-crud', component: EmplacementsCrudComponent },
    { path: 'utilisateurs', component: ListUtilisateurComponent },
    { path: 'activity-history', component: ActivityHistoryComponent },
    { path: 'appels', component: AppelsOffreListComponent },
    { path: 'appels/:id/reponses', component: ReponsesComponent },
  ]
}

// Espace Boutique (protégé)
{
  path: 'boutique',
  component: BoutiqueLayoutComponent,
  canActivate: [authGuard, roleGuard(['admin', 'boutique'])],
  children: [
    { path: 'dashboard', component: BoutiqueDashboardComponent },
    { path: 'produits', component: ProduitListComponent },
    { path: 'produits/nouveau', component: ProduitCreateComponent },
    { path: 'produits/edit/:id', component: ProduitEditComponent },
    { path: 'categories', component: CategorieListComponent },
    { path: 'appels/:id/reponses', component: ReponsesComponent },
  ]
}

// Espace Client
{
  path: 'client',
  component: ClientLayoutComponent,
  children: [
    { path: 'accueil', loadComponent: () => import(...) },
    { path: 'appels', component: AppelsOffreClientComponent },
    { path: 'appels/:id/reponse', component: ResponseFormClientComponent },
  ]
}
```

### Arbre de Navigation

```
/ (Landing Page)
│
├── /login (Admin Login)
├── /client-login
├── /client-register
├── /boutique-login
│
├── /admin (Layout Admin)
│   ├── /admin/dashboard
│   ├── /admin/plan-centre
│   ├── /admin/centres
│   ├── /admin/centres/centres-crud
│   ├── /admin/centres/batiments-crud
│   ├── /admin/centres/etages-crud
│   ├── /admin/centres/emplacements-crud
│   ├── /admin/utilisateurs
│   ├── /admin/activity-history
│   ├── /admin/appels
│   └── /admin/appels/:id/reponses
│
├── /boutique (Layout Boutique)
│   ├── /boutique/dashboard
│   ├── /boutique/produits
│   ├── /boutique/produits/nouveau
│   ├── /boutique/produits/edit/:id
│   ├── /boutique/categories
│   └── /boutique/appels/:id/reponses
│
└── /client (Layout Client)
    ├── /client/accueil
    ├── /client/appels
    └── /client/appels/:id/reponse
```

---

## 🔐 Système d'Authentification

### AuthService (`auth.service.ts`)

Service singleton qui gère l'état d'authentification avec **BehaviorSubject** :

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  // État réactif
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Méthodes principales
  login(credentials, roleRestriction?): Observable<AuthResponse>
  register(userData: RegisterRequest): Observable<AuthResponse>
  logout(): void
  getToken(): string | null
  isAuthenticated(): boolean
  getCurrentUser(): User | null
}
```

### Flux d'Authentification

```
┌──────────────────────────────────────────────────────────────┐
│  1. Utilisateur saisit email/mot de passe                    │
│                      ↓                                       │
│  2. AuthService.login() → POST /auth/connexion               │
│                      ↓                                       │
│  3. Backend retourne { token, utilisateur }                  │
│                      ↓                                       │
│  4. Stockage localStorage:                                   │
│     - auth_token                                             │
│     - auth_user                                              │
│                      ↓                                       │
│  5. Mise à jour BehaviorSubject                              │
│                      ↓                                       │
│  6. Navigation vers dashboard                                │
└──────────────────────────────────────────────────────────────┘
```

### Gestion du Token JWT

```typescript
// Vérification d'expiration
private isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true;
  }
}
```

---

## 🛡️ Guards et Sécurité

### 1. authGuard

Vérifie que l'utilisateur est authentifié :

```typescript
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    map(isAuthenticated => {
      if (isAuthenticated && authService.isAuthenticated()) {
        return true;
      }
      router.navigate(['/login']);
      return false;
    })
  );
};
```

### 2. roleGuard

Vérifie le rôle de l'utilisateur :

```typescript
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.currentUser$.pipe(
      map(user => {
        if (user && allowedRoles.includes(user.role)) {
          return true;
        }
        router.navigate(['/']);
        return false;
      })
    );
  };
};
```

### 3. adminGuard

Accès réservé aux administrateurs :

```typescript
export const adminGuard = (): CanActivateFn => {
  return roleGuard(['admin']);
};
```

### 4. guestGuard

Redirige les utilisateurs déjà connectés (pour les pages de login) :

```typescript
export const guestGuard = (): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
      router.navigate(['/admin/dashboard']);
      return false;
    }
    return true;
  };
};
```

### Matrice des Guards

| Route | authGuard | roleGuard | guestGuard |
|-------|-----------|-----------|------------|
| `/login` | ❌ | ❌ | ✅ |
| `/client-login` | ❌ | ❌ | ✅ |
| `/admin/*` | ✅ | `['admin']` | ❌ |
| `/boutique/*` | ✅ | `['admin', 'boutique']` | ❌ |
| `/client/*` | ❌ | ❌ | ❌ |

---

## 🔌 Interceptors HTTP

### 1. authInterceptor

Ajoute automatiquement le token JWT aux requêtes :

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }
  return next(req);
};
```

### 2. errorInterceptor

Gère centralisement les erreurs HTTP :

```typescript
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastService = inject(ToastService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
        toastService.showError('Session expirée');
      } else if (error.status === 403) {
        toastService.showError('Accès non autorisé');
      } else if (error.status === 404) {
        toastService.showError('Ressource non trouvée');
      } else if (error.status === 500) {
        toastService.showError('Erreur serveur');
      }
      return throwError(() => error);
    })
  );
};
```

### 3. loggingInterceptor

Logge toutes les requêtes pour le débogage :

```typescript
// Logge: méthode, URL, temps de réponse, statut
```

### Configuration dans `app.config.ts`

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor, loggingInterceptor])
    ),
    // ...
  ]
};
```

---

## 📦 Services Principaux

### Services Globaux (`/services`)

| Service | Description | Méthodes Principales |
|---------|-------------|---------------------|
| **AuthService** | Authentification JWT | `login()`, `logout()`, `register()`, `getToken()` |
| **ToastService** | Notifications toast | `showSuccess()`, `showError()`, `showInfo()` |
| **LogService** | Gestion des logs | `getLogs()`, `getLogsByUser()` |
| **SidebarService** | État de la sidebar | `toggle()`, `isOpen()` |

### Services Admin (`/admin/components/*/services`)

| Service | Description |
|---------|-------------|
| **CentresService** | CRUD des centres, bâtiments, étages, emplacements |
| **AppelsOffreService** | Gestion des appels d'offre |
| **ReponsesService** | Gestion des réponses aux appels |
| **UtilisateurService** | Gestion des utilisateurs |
| **LogsService** | Consultation des logs |

### Services Boutique (`/boutique/components/*/services`)

| Service | Description |
|---------|-------------|
| **CategorieService** | CRUD des catégories avec hiérarchie |
| **ProduitService** | CRUD des produits avec filtres |

### Services Client (`/client/services`)

| Service | Description |
|---------|-------------|
| **AppelsOffreService** | Consultation des appels d'offre publics |

### Services Shared (`/shared/services`)

| Service | Description |
|---------|-------------|
| **BreadcrumbService** | Gestion du fil d'ariane |
| **CentreService** | Récupération des centres (public) |

---

## 🧩 Composants par Espace

### Espace Admin

| Composant | Description |
|-----------|-------------|
| **AdminDashboardComponent** | Tableau de bord avec statistiques |
| **PlanCentreComponent** | Visualisation interactive du plan du centre |
| **CentresListComponent** | Liste des centres commerciaux |
| **CentreCrudComponent** | Création/Modification de centre |
| **BatimentsCrudComponent** | CRUD des bâtiments |
| **EtagesCrudComponent** | CRUD des étages |
| **EmplacementsCrudComponent** | CRUD des emplacements (box, kiosques) |
| **ListUtilisateurComponent** | Liste et gestion des utilisateurs |
| **ActivityHistoryComponent** | Historique des activités |
| **AppelsOffreListComponent** | Liste des appels d'offre |
| **ReponsesComponent** | Gestion des réponses aux appels |
| **AdminSidebarComponent** | Menu latéral admin |

### Espace Boutique

| Composant | Description |
|-----------|-------------|
| **BoutiqueDashboardComponent** | Tableau de bord boutique |
| **ProduitListComponent** | Liste des produits avec filtres |
| **ProduitCreateComponent** | Formulaire de création produit |
| **ProduitEditComponent** | Formulaire de modification produit |
| **CategorieListComponent** | Liste des catégories hiérarchiques |
| **BoutiqueSidebarComponent** | Menu latéral boutique |

### Espace Client

| Composant | Description |
|-----------|-------------|
| **HomeComponent** | Page d'accueil client |
| **AppelsOffreClientComponent** | Liste des appels d'offre ouverts |
| **ResponseFormClientComponent** | Formulaire de réponse à un appel |

### Pages Publiques

| Composant | Description |
|-----------|-------------|
| **LandingComponent** | Page d'atterrissage |
| **AdminLoginComponent** | Connexion administrateur |
| **BoutiqueLoginComponent** | Connexion boutique |
| **ClientLoginComponent** | Connexion client |
| **ClientRegisterComponent** | Inscription client |

### Composants Shared

| Composant | Description |
|-----------|-------------|
| **ModalComponent** | Modale réutilisable |
| **LoaderComponent** | Indicateur de chargement |
| **ToastComponent** | Notifications toast |
| **TableComponent** | Tableau de données générique |
| **CardComponent** | Card générique |
| **FormComponent** | Formulaire générique |
| **BreadcrumbComponent** | Fil d'ariane |
| **NavbarComponent** | Barre de navigation |
| **FooterComponent** | Pied de page |

---

## 🔄 Gestion des États

### BehaviorSubject pour l'Authentification

```typescript
// Dans AuthService
private currentUserSubject = new BehaviorSubject<User | null>(null);
private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

// Les composants s'abonnent
authService.currentUser$.subscribe(user => {
  console.log('Utilisateur connecté:', user);
});

authService.isAuthenticated$.subscribe(isAuth => {
  console.log('État authentification:', isAuth);
});
```

### Initialisation au Démarrage

```typescript
private initializeAuth(): void {
  const token = this.getToken();
  const user = this.getStoredUser();

  if (token && user && !this.isTokenExpired(token)) {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  } else {
    this.clearStorage();
  }
}
```

---

## 🌐 Communication avec le Backend

### Configuration des Environnements

**Développement (`environment.ts`) :**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000',
};
```

**Production (`environment.prod.ts`) :**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://m1p13mean-henintsoa-joann.vercel.app',
};
```

### Exemple de Service HTTP

```typescript
@Injectable({ providedIn: 'root' })
export class CentresService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/admin/centres`;

  getCentres(): Observable<Centre[]> {
    return this.http.get<Centre[]>(this.apiUrl);
  }

  getCentreById(id: string): Observable<Centre> {
    return this.http.get<Centre>(`${this.apiUrl}/${id}`);
  }

  createCentre(centre: Centre): Observable<Centre> {
    return this.http.post<Centre>(this.apiUrl, centre);
  }

  updateCentre(id: string, centre: Centre): Observable<Centre> {
    return this.http.put<Centre>(`${this.apiUrl}/${id}`, centre);
  }

  deleteCentre(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### Interfaces TypeScript

```typescript
// auth.interface.ts
export interface User {
  _id: string;
  email: string;
  prenom: string;
  nom: string;
  role: 'admin' | 'boutique' | 'client';
  actif: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  utilisateur: User;
}

export interface LoginRequest {
  email: string;
  mot_de_passe: string;
}

export interface RegisterRequest {
  email: string;
  mot_de_passe: string;
  prenom: string;
  nom: string;
  telephone?: string;
  role?: string;
  confirmPassword: string;
}
```

---

## 🚀 Configuration et Déploiement

### Installation Locale

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer en développement
npm start
# ou
ng serve

# L'application est accessible sur http://localhost:4200
```

### Build de Production

```bash
# Build standard
npm run build

# Build avec configuration production
npm run build:prod

# Watch mode (développement)
npm run watch
```

### Déploiement Vercel

**Configuration (`vercel.json`) :**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/frontend/browser",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Déploiement :**
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Production
vercel --prod
```

---

## 📝 Commandes Disponibles

| Commande | Description |
|----------|-------------|
| `npm run ng` | CLI Angular |
| `npm start` | Démarrer en développement |
| `npm run build` | Build de production |
| `npm run build:prod` | Build avec configuration production |
| `npm run watch` | Build en watch mode |
| `npm test` | Exécuter les tests unitaires |
| `npm run deploy` | Build + message de déploiement |

---

## 📌 Points Importants

### Bonnes Pratiques

- ✅ **Components Standalone** (Angular 21)
- ✅ **Signals** pour la réactivité
- ✅ **HttpClient avec interceptors**
- ✅ **Guards fonctionnels** (functional guards)
- ✅ **Injection avec `inject()`** (au lieu de constructor)
- ✅ **RxJS avec pipeable operators**
- ✅ **Typage fort TypeScript**
- ✅ **Environnements séparés (dev/prod)**

### Architecture

- ✅ **Séparation par espace** (admin, boutique, client)
- ✅ **Composants shared réutilisables**
- ✅ **Services singleton avec `providedIn: 'root'`**
- ✅ **Interfaces pour le typage des données API**
- ✅ **Gestion centralisée des erreurs**
- ✅ **Guards de sécurité sur les routes**

### Performance

- ✅ **Lazy loading** des composants
- ✅ **Cache-Control** pour les assets
- ✅ **Build optimisé** avec hash des fichiers
- ✅ **Tree-shaking** avec TypeScript

---

## 🔗 Liens Utiles

- [Documentation Angular](https://angular.dev/)
- [RxJS Documentation](https://rxjs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Vercel Documentation](https://vercel.com/docs)

---

**Développé avec ❤️ en Angular 21 + TypeScript**
