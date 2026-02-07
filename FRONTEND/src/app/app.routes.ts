import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin/components/dashboard/admin-dashboard.component';
import { PlanCentreComponent } from './admin/components/plan-centre/plan-centre';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { authGuard } from './shared/guards/auth.guard';
import { guestGuard } from './shared/guards/guest.guard';
import { ActivityHistoryComponent } from './admin/components/activity-history/activity-history.component';

// Centres components
import { CentresListComponent } from './admin/components/centres/pages/centres-list/centres-list.component';
import { CentreCrudComponent } from './admin/components/centres/pages/centre-crud/centre-crud.component';
import { BatimentsCrudComponent } from './admin/components/centres/pages/batiments-crud/batiments-crud.component';
import { EtagesCrudComponent } from './admin/components/centres/pages/etages-crud/etages-crud.component';
import { EmplacementsCrudComponent } from './admin/components/centres/pages/emplacements-crud/emplacements-crud.component';
import { ListUtilisateurComponent } from './admin/components/utilisateurs/pages/list-utilisateur/list-utilisateur.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
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
  { path: '**', redirectTo: '/login' },
];
