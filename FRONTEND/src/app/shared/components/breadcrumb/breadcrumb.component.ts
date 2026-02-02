import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { filter, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

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
    'login': 'Connexion'
  };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
      });

    // Initialiser les breadcrumbs
    this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: BreadcrumbItem[] = []): BreadcrumbItem[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      
      if (routeURL !== '') {
        url += `/${routeURL}`;
        
        // Obtenir le label pour cette route
        const label = this.getRouteLabel(routeURL);
        
        breadcrumbs.push({
          label,
          url: url
        });
      }

      return this.createBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  private getRouteLabel(route: string): string {
    return this.routeLabels[route] || route.charAt(0).toUpperCase() + route.slice(1);
  }
}