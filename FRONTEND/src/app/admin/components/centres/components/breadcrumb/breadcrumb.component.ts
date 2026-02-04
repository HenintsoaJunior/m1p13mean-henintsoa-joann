import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  icon?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="breadcrumb-nav">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <a routerLink="/admin/centres" class="breadcrumb-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="breadcrumb-icon">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
            Centres
          </a>
        </li>
        <li *ngFor="let item of items; let last = last" class="breadcrumb-item" [class.active]="last">
          <span class="breadcrumb-separator">/</span>
          <a *ngIf="item.url && !last" [routerLink]="item.url" class="breadcrumb-link">
            <svg *ngIf="item.icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="breadcrumb-icon">
              <path [attr.d]="item.icon" />
            </svg>
            {{ item.label }}
          </a>
          <span *ngIf="!item.url || last" class="breadcrumb-text">
            <svg *ngIf="item.icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="breadcrumb-icon">
              <path [attr.d]="item.icon" />
            </svg>
            {{ item.label }}
          </span>
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb-nav {
      background: white;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0;
      flex-wrap: wrap;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      
      &.active .breadcrumb-text {
        color: #6366f1;
        font-weight: 500;
      }
    }

    .breadcrumb-separator {
      margin: 0 8px;
      color: #9ca3af;
      font-size: 14px;
    }

    .breadcrumb-link {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #6b7280;
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s ease;
      
      &:hover {
        color: #6366f1;
      }
    }

    .breadcrumb-text {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #374151;
      font-size: 14px;
    }

    .breadcrumb-icon {
      width: 16px;
      height: 16px;
      opacity: 0.7;
    }
  `]
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
}