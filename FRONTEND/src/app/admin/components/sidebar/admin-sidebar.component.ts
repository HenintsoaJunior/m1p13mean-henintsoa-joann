import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SidebarService } from '../../../services/sidebar.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss'],
})
export class AdminSidebarComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  currentRoute = '';
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private sidebarService: SidebarService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.currentRoute = this.router.url;
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });

    // Écouter les changements d'état du sidebar
    this.sidebarService.collapsed$.pipe(takeUntil(this.destroy$)).subscribe((collapsed) => {
      this.isCollapsed = collapsed;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onLogout(event: Event) {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
