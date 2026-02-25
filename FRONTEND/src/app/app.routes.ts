import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin/components/dashboard/admin-dashboard.component';
import { PlanCentreComponent } from './admin/components/plan-centre/plan-centre';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { ClientLoginComponent } from './pages/client-login/client-login.component';
import { BoutiqueLoginComponent } from './pages/boutique-login/boutique-login.component';
import { ClientRegisterComponent } from './pages/client-register/client-register.component';
import { LandingComponent } from './pages/landing/landing.component';
// import { ClientHomeComponent } from './client/client-home/client-home.component'; // Removed since component was deleted
import { ClientLayoutComponent } from './layouts/client-layout/client-layout.component';
import { authGuard } from './shared/guards/auth.guard';
import { guestGuard } from './shared/guards/guest.guard';
import { adminGuard } from './shared/guards/admin.guard';
import { roleGuard } from './shared/guards/role.guard';
import { ActivityHistoryComponent } from './admin/components/activity-history/activity-history.component';

// Centres components
import { CentresListComponent } from './admin/components/centres/pages/centres-list/centres-list.component';
import { CentreCrudComponent } from './admin/components/centres/pages/centre-crud/centre-crud.component';
import { BatimentsCrudComponent } from './admin/components/centres/pages/batiments-crud/batiments-crud.component';
import { EtagesCrudComponent } from './admin/components/centres/pages/etages-crud/etages-crud.component';
import { EmplacementsCrudComponent } from './admin/components/centres/pages/emplacements-crud/emplacements-crud.component';
import { ListUtilisateurComponent } from './admin/components/utilisateurs/pages/list-utilisateur/list-utilisateur.component';
import { BoutiqueLayoutComponent } from './layouts/boutique-layout/boutique-layout.component';
import { BoutiqueDashboardComponent } from './boutique/pages/dashboard/boutique-dashboard.component';

// Boutique components - Produits
import { ProduitListComponent } from './boutique/components/produits/pages/produit-list/produit-list.component';

// Boutique components - Categories
import { CategorieListComponent } from './boutique/components/categories/pages/categorie-list/categorie-list.component';
import { CategorieFormComponent } from './boutique/components/categories/components/categorie-form/categorie-form.component';

export const routes: Routes = [
  { path: '', component: LandingComponent }, // Default landing page
  {
    path: 'login',
    component: AdminLoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'client-login',
    component: ClientLoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'client-register',
    component: ClientRegisterComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'boutique-login',
    component: BoutiqueLoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard(['admin'])], // Only admin can access admin panel
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'plan-centre', component: PlanCentreComponent },
      { path: 'centres/centres-crud', component: CentreCrudComponent },
      { path: 'centres/batiments-crud', component: BatimentsCrudComponent },
      { path: 'centres/etages-crud', component: EtagesCrudComponent },
      { path: 'centres/emplacements-crud', component: EmplacementsCrudComponent },
      { path: 'centres', component: CentresListComponent },
      { path: 'utilisateurs', component: ListUtilisateurComponent },
      { path: 'activity-history', component: ActivityHistoryComponent },
    ],
  },
  // Add routes for boutique and client dashboards
  {
    path: 'boutique',
    component: BoutiqueLayoutComponent,
    canActivate: [authGuard, roleGuard(['admin', 'boutique'])],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: BoutiqueDashboardComponent },
      { path: 'produits', component: ProduitListComponent },
      { path: 'categories', component: CategorieListComponent },
      { path: 'categories/nouvelle', component: CategorieFormComponent },
      { path: 'categories/modification/:id', component: CategorieFormComponent },
    ],
  },
  {
    path: 'client',
    component: ClientLayoutComponent,
    children: [
      { path: '', redirectTo: 'accueil', pathMatch: 'full' }, // Redirect /client to /client/accueil
      { path: 'accueil', loadComponent: () => import('./client/components/home/home.component').then(m => m.HomeComponent) }, // Client home page (accessible to all)
    ],
  },
  { path: '**', redirectTo: '/' }, // Redirect unknown routes to landing page
];
