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
  templateUrl: './admin-layout.component.html',
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
