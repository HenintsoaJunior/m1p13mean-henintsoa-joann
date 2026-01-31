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
  template: `
    <nav class="breadcrumb-nav" aria-label="Breadcrumb">
      <ol class="breadcrumb-list">
        <li class="breadcrumb-item" *ngFor="let breadcrumb of breadcrumbs; let isLast = last">
          <a 
            *ngIf="breadcrumb.url && !isLast; else labelOnly"
            [routerLink]="breadcrumb.url"
            class="breadcrumb-link">
            {{ breadcrumb.label }}
          </a>
          <ng-template #labelOnly>
            <span class="breadcrumb-current">{{ breadcrumb.label }}</span>
          </ng-template>
          <svg 
            *ngIf="!isLast" 
            class="breadcrumb-separator"
            width="6" 
            height="10" 
            viewBox="0 0 6 10" 
            fill="currentColor">
            <path d="M1 1l4 4-4 4"/>
          </svg>
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb-nav {
      padding: 0;
      margin: 0;
    }

    .breadcrumb-list {
      display: flex;
      align-items: center;
      list-style: none;
      padding: 0;
      margin: 0;
      gap: 8px;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .breadcrumb-link {
      color: #64748b;
      text-decoration: none;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .breadcrumb-link:hover {
      color: #3660a9;
      background-color: #f1f5f9;
      text-decoration: none;
    }

    .breadcrumb-current {
      color: #334155;
      font-weight: 600;
      padding: 4px 8px;
    }

    .breadcrumb-separator {
      color: #94a3b8;
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      .breadcrumb-item {
        font-size: 13px;
      }
    }
  `]
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