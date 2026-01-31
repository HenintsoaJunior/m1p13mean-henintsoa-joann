import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterModule],
  template: `
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <h3>Administration</h3>
      </div>
      <nav class="sidebar-nav">
        <ul class="sidebar-menu">
          <li>
            <a routerLink="/admin/dashboard" 
               routerLinkActive="active" 
               class="sidebar-link">
              <span class="sidebar-icon">📊</span>
              <span class="sidebar-text">Tableau de bord</span>
            </a>
          </li>
          <li>
            <a routerLink="/admin/users" 
               routerLinkActive="active" 
               class="sidebar-link">
              <span class="sidebar-icon">👥</span>
              <span class="sidebar-text">Utilisateurs</span>
            </a>
          </li>
          <li>
            <a routerLink="/admin/boutiques" 
               routerLinkActive="active" 
               class="sidebar-link">
              <span class="sidebar-icon">🏪</span>
              <span class="sidebar-text">Boutiques</span>
            </a>
          </li>
          <li>
            <a routerLink="/admin/reports" 
               routerLinkActive="active" 
               class="sidebar-link">
              <span class="sidebar-icon">📈</span>
              <span class="sidebar-text">Rapports</span>
            </a>
          </li>
          <li>
            <a routerLink="/admin/settings" 
               routerLinkActive="active" 
               class="sidebar-link">
              <span class="sidebar-icon">⚙️</span>
              <span class="sidebar-text">Paramètres</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  `,
  styleUrls: ['./admin-sidebar.component.scss']
})
export class AdminSidebarComponent {}