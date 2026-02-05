import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { filter, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BreadcrumbService, BreadcrumbItem } from '../../services/breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  breadcrumbs: BreadcrumbItem[] = [];
  private destroy$ = new Subject<void>();

  private routeLabels: { [key: string]: string } = {
    'admin': 'Administration',
    'dashboard': 'Tableau de bord',
    'users': 'Utilisateurs',
    'boutiques': 'Boutiques',
    'reports': 'Rapports',
    'settings': 'Paramètres',
    'login': 'Connexion',
    'centres': 'Centres',
    'centres-crud': 'Centres CRUD',
    'batiments-crud': 'Bâtiments CRUD',
    'etages-crud': 'Étages CRUD',
    'emplacements-crud': 'Emplacements CRUD'
  };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit() {
    // S'abonner au service de breadcrumb
    this.breadcrumbService.breadcrumbs$
      .pipe(takeUntil(this.destroy$))
      .subscribe(breadcrumbs => {
        if (breadcrumbs && breadcrumbs.length > 0) {
          // Utiliser les breadcrumbs du service
          this.breadcrumbs = breadcrumbs;
        } else {
          // Fallback: créer les breadcrumbs depuis la route
          this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
        }
      });

    // Écouter les changements de route pour le fallback
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        const serviceBreadcrumbs = this.breadcrumbService.getBreadcrumbs();
        if (!serviceBreadcrumbs || serviceBreadcrumbs.length === 0) {
          this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
        }
      });

    // Initialiser les breadcrumbs
    const serviceBreadcrumbs = this.breadcrumbService.getBreadcrumbs();
    if (serviceBreadcrumbs && serviceBreadcrumbs.length > 0) {
      this.breadcrumbs = serviceBreadcrumbs;
    } else {
      this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: BreadcrumbItem[] = []): BreadcrumbItem[] {
    // Construire le chemin complet depuis la racine
    const pathSegments: string[] = [];
    let currentRoute = route;

    // Parcourir toutes les routes pour construire le chemin complet
    while (currentRoute.children && currentRoute.children.length > 0) {
      currentRoute = currentRoute.children[0];
      if (currentRoute.snapshot.url.length > 0) {
        currentRoute.snapshot.url.forEach(segment => {
          pathSegments.push(segment.path);
        });
      }
    }

    // Construire les breadcrumbs en fonction des segments
    let fullUrl = '';
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      fullUrl += `/${segment}`;
      
      // Obtenir le label pour ce segment
      const label = this.getRouteLabel(segment, pathSegments, i);
      
      breadcrumbs.push({
        label,
        url: fullUrl
      });
    }

    return breadcrumbs;
  }

  private getRouteLabel(route: string, pathSegments: string[], index: number): string {
    // Logique spéciale pour les routes de centres
    if (route === 'centres' && pathSegments[index - 1] === 'admin') {
      return 'Centres';
    }
    if (route.endsWith('-crud') && pathSegments[index - 1] === 'centres') {
      // Pour les pages CRUD, utiliser le label défini
      return this.routeLabels[route] || route.charAt(0).toUpperCase() + route.slice(1);
    }
    
    return this.routeLabels[route] || route.charAt(0).toUpperCase() + route.slice(1);
  }
}