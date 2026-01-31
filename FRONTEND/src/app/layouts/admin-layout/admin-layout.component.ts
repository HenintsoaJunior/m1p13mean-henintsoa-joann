import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { AdminSidebarComponent } from '../../admin/components/sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, AdminSidebarComponent],
  template: `
    <div class="admin-layout">
      <app-navbar class="navbar"></app-navbar>
      <div class="main-layout">
        <app-admin-sidebar class="sidebar"></app-admin-sidebar>
        <div class="content-area">
          <main class="main-content">
            <router-outlet></router-outlet>
          </main>
          <app-footer></app-footer>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent {}
