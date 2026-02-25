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
        <p class="text-gray-600 mt-2">Gérez vos produits et catégories depuis ce tableau de bord.</p>

        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            [routerLink]="['/boutique/produits']"
            class="border border-blue-200 rounded-lg p-4 hover:bg-blue-50 hover:shadow-md transition duration-200"
          >
            <div class="flex items-center gap-3">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
              <div>
                <h3 class="font-semibold text-lg text-gray-900">Produits</h3>
                <p class="text-gray-600 text-sm">Gérer vos produits</p>
              </div>
            </div>
          </a>
          <a
            [routerLink]="['/boutique/categories']"
            class="border border-green-200 rounded-lg p-4 hover:bg-green-50 hover:shadow-md transition duration-200"
          >
            <div class="flex items-center gap-3">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
              </svg>
              <div>
                <h3 class="font-semibold text-lg text-gray-900">Catégories</h3>
                <p class="text-gray-600 text-sm">Gérer vos catégories</p>
              </div>
            </div>
          </a>
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-semibold text-lg text-gray-900">Rapports</h3>
            <p class="text-gray-600 text-sm">Bientôt disponible</p>
          </div>
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-semibold text-lg text-gray-900">Notifications</h3>
            <p class="text-gray-600 text-sm">Bientôt disponible</p>
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
