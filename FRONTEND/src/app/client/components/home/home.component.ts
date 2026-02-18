import { Component, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  showLogoutPopup = false;

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get userName(): string {
    const user = this.authService.getCurrentUser();
    return user?.nom || user?.prenom || user?.email || 'Utilisateur';
  }

  isClient(): boolean {
    const user = this.authService.getCurrentUser();
    // Show "Devenir vendeur" button only if user exists and is not an admin or boutique
    return user ? user.role !== 'admin' && user.role !== 'boutique' : false;
  }

  onProfileClick() {
    if (this.isLoggedIn) {
      this.showLogoutPopup = true;
    } else {
      this.router.navigate(['/client-login']);
    }
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/client-login']);
    this.showLogoutPopup = false;
  }

  closePopup() {
    this.showLogoutPopup = false;
  }

  getUserInitials(): string {
    const user = this.authService.getCurrentUser();
    if (user) {
      const firstName = user.prenom ? user.prenom.charAt(0).toUpperCase() : '';
      const lastName = user.nom ? user.nom.charAt(0).toUpperCase() : '';
      return firstName + lastName || 'U';
    }
    return 'U';
  }

  getUserEmail(): string {
    const user = this.authService.getCurrentUser();
    return user?.email || '';
  }
}
