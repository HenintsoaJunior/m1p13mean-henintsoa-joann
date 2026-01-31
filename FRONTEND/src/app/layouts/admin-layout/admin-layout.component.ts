import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { AdminSidebarComponent } from '../../admin/components/sidebar/admin-sidebar.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../services/sidebar.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, AdminSidebarComponent, BreadcrumbComponent, CommonModule],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar></app-admin-sidebar>
      <div class="content-area" [class.sidebar-collapsed]="sidebarCollapsed">
        <nav class="navbar">
          <div class="navbar-content">
            <div class="navbar-left">
              <button class="toggle-btn" (click)="toggleSidebar()" title="Toggle menu">
                <div class="burger-icon">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </button>
              <app-breadcrumb class="breadcrumb"></app-breadcrumb>
            </div>
            <div class="navbar-actions">
              <button class="notification-btn" title="Notifications">
                🔔
                <span class="notification-badge">3</span>
              </button>
              <div class="user-menu">
                <div class="user-avatar">👨‍💼</div>
                <span class="user-name">Admin</span>
              </div>
            </div>
          </div>
        </nav>
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
        <app-footer></app-footer>
      </div>
    </div>
  `,
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  private destroy$ = new Subject<void>();

  constructor(private sidebarService: SidebarService) {}

  ngOnInit() {
    // Écouter les changements d'état du sidebar
    this.sidebarService.collapsed$
      .pipe(takeUntil(this.destroy$))
      .subscribe(collapsed => {
        this.sidebarCollapsed = collapsed;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }
}
