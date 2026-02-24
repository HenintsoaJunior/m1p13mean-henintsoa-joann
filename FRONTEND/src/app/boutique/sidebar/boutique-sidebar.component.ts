import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-boutique-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './boutique-sidebar.component.html',
  styleUrls: ['./boutique-sidebar.component.scss'],
})
export class BoutiqueSidebarComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  currentRoute = '';
  isMobileView = false;
  @Input() isSidebarOpen = false;
  @Output() closeRequested = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService,
    private sidebarService: SidebarService,
  ) {}

  ngOnInit() {
    this.currentRoute = this.router.url;
    this.checkScreenSize();

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });

    this.sidebarService.collapsed$
      .pipe(takeUntil(this.destroy$))
      .subscribe((collapsed: boolean) => {
        if (!this.isMobileView) {
          this.isCollapsed = collapsed;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobileView = window.innerWidth < 1024;
    if (this.isMobileView) {
      this.isCollapsed = true;
    }
  }

  closeSidebar() {
    if (this.isMobileView) {
      this.closeRequested.emit();
    }
  }

  onLogout(event: Event) {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/boutique-login']);
    this.closeSidebar();
  }
}
