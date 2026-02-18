import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-boutique-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Tableau de bord Boutique</h1>
        <button
          (click)="onLogout()"
          class="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition duration-200"
        >
          Déconnexion
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <p class="text-gray-700">Bienvenue dans votre espace boutique !</p>
        <p class="text-gray-600 mt-2">Ici vous pouvez gérer vos activités commerciales.</p>

        <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-semibold text-lg">Mes Emplacements</h3>
            <p class="text-gray-600">Gérer mes espaces réservés</p>
          </div>
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-semibold text-lg">Rapports</h3>
            <p class="text-gray-600">Voir mes rapports</p>
          </div>
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-semibold text-lg">Notifications</h3>
            <p class="text-gray-600">Consulter mes notifications</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class BoutiqueDashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/boutique-login']);
  }
}
