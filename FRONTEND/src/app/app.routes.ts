import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin/components/dashboard/admin-dashboard.component';
import { PlanCentreComponent } from './admin/components/plan-centre/plan-centre';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { ClientLoginComponent } from './pages/client-login/client-login.component';
import { BoutiqueLoginComponent } from './pages/boutique-login/boutique-login.component';
import { ClientRegisterComponent } from './pages/client-register/client-register.component';
import { LandingComponent } from './pages/landing/landing.component';
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
    loadComponent: () => import('./boutique/boutique-dashboard.component').then(m => m.BoutiqueDashboardComponent),
    canActivate: [authGuard, roleGuard(['boutique'])], // Only boutique can access boutique dashboard
  },
  {
    path: 'client',
    loadComponent: () => import('./client/client-dashboard.component').then(m => m.ClientDashboardComponent),
    canActivate: [authGuard, roleGuard(['client'])], // Only client can access client dashboard
  },
  { path: '**', redirectTo: '/' }, // Redirect unknown routes to landing page
];
