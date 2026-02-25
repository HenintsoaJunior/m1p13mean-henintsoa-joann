import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { BoutiqueSidebarComponent } from '../../boutique/components/sidebar/boutique-sidebar.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../services/sidebar.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-boutique-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    FooterComponent,
    BoutiqueSidebarComponent,
    BreadcrumbComponent,
    CommonModule,
  ],
  templateUrl: './boutique-layout.component.html',
  styleUrls: ['./boutique-layout.component.scss'],
})
export class BoutiqueLayoutComponent implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  isMobileView = false;
  isSidebarOpen = false; // Pour gérer l'état ouvert/fermé sur mobile
  private destroy$ = new Subject<void>();

  constructor(private sidebarService: SidebarService) {}

  ngOnInit() {
    this.checkScreenSize();

    // Écouter les changements d'état du sidebar
    this.sidebarService.collapsed$
      .pipe(takeUntil(this.destroy$))
      .subscribe(collapsed => {
        // Sur mobile, on utilise isSidebarOpen au lieu de sidebarCollapsed
        if (!this.isMobileView) {
          this.sidebarCollapsed = collapsed;
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
    // Sur mobile, le sidebar est toujours considéré comme réduit
    if (this.isMobileView) {
      this.sidebarCollapsed = true;
    }
  }

  toggleSidebar() {
    if (this.isMobileView) {
      // Sur mobile, on gère l'ouverture/fermeture du sidebar
      this.isSidebarOpen = !this.isSidebarOpen;

      // Ajouter/enlever la classe sur le body pour gérer le scroll
      if (this.isSidebarOpen) {
        document.body.classList.add('sidebar-open');
      } else {
        document.body.classList.remove('sidebar-open');
      }
    } else {
      // Sur desktop, on utilise le service
      this.sidebarService.toggleSidebar();
    }
  }
}
