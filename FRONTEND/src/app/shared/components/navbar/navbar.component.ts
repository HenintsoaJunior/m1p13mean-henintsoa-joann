import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  currentUser$ = this.authService.currentUser$;
  showMobileMenu = false;
  
  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/']);
    this.showMobileMenu = false;
  }
}