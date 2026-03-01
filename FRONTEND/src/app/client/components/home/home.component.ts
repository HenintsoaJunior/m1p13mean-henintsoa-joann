import { Component, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { AppelsOffreClientComponent } from '../appels-offre/appels-offre-client.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgIf, AppelsOffreClientComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  showLogoutPopup = false;
  activeTab = 'nouveautes'; // Track active tab

  // no longer navigating away, simply render inline

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get userName(): string {
    const user = this.authService.getCurrentUser();
    return user?.nom || user?.prenom || user?.email || 'Utilisateur';
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

  selectTab(tabName: string): void {
    this.activeTab = tabName;
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
