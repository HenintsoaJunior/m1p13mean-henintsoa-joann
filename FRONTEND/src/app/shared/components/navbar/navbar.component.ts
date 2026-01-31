import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <!-- Logo/Titre -->
        <div class="navbar-brand">
          <h1>Administration</h1>
        </div>
        
        <!-- Menu desktop -->
        <div class="navbar-menu">
          <a routerLink="/admin" class="navbar-link">Administration</a>
          <a routerLink="/login" class="navbar-link">Connexion</a>
        </div>
        
        <!-- Menu mobile -->
        <div class="navbar-mobile">
          <button (click)="toggleMobileMenu()" class="mobile-menu-btn">
            {{ showMobileMenu ? '✕' : '☰' }}
          </button>
          <div class="mobile-menu" [class.visible]="showMobileMenu">
            <a routerLink="/admin" class="mobile-menu-link" (click)="toggleMobileMenu()">Administration</a>
            <a routerLink="/login" class="mobile-menu-link" (click)="toggleMobileMenu()">Connexion</a>
          </div>
        </div>
      </div>
    </nav>
  `,
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  showMobileMenu = false;
  
  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }
}