import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategorieTree } from '../../services/categorie.service';
import { FilterService } from '../../services/filter.service';

@Component({
  selector: 'app-category-node',
  standalone: true,
  imports: [CommonModule, CategoryNodeComponent],
  template: `
    <div class="category-node">
      <div
        class="category-item"
        [class.expanded]="expanded"
        [class.has-children]="cat.children && cat.children.length > 0"
        [class.root-item]="level === 0"
        [class.selected]="isSelected"
        (click)="select()"
      >
        <!-- Dot indicator for sub-items -->
        <span *ngIf="level > 0" class="dot-indicator"></span>

        <!-- Icon for root items -->
        <span *ngIf="level === 0" class="cat-icon">
          <i class="fas fa-layer-group"></i>
        </span>

        <!-- Name -->
        <span class="category-name" [title]="cat.nom">{{ cat.nom }}</span>

        <!-- Chevron for items with children -->
        <span *ngIf="cat.children && cat.children.length > 0" class="chevron" [class.open]="expanded">
          <i class="fas fa-chevron-down"></i>
        </span>
      </div>

      <!-- Children with animated container -->
      <div *ngIf="expanded && cat.children && cat.children.length > 0" class="category-children">
        <app-category-node
          *ngFor="let child of cat.children"
          [cat]="child"
          [level]="level + 1"
        ></app-category-node>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .category-node {
      width: 100%;
    }

    .category-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 10px 7px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 400;
      color: #4b5563;
      transition: background 0.15s ease, color 0.15s ease;
      user-select: none;
      line-height: 1.4;
      margin-bottom: 1px;
    }

    /* Root level items — stronger */
    .category-item.root-item {
      font-weight: 600;
      font-size: 13.5px;
      color: #1f2937;
      padding-left: 10px;
    }

    .category-item.root-item.expanded {
      color: #3660a9;
      background-color: #eef2fb;
    }

    /* Selected state */
    .category-item.selected {
      background-color: #dce8fb;
      color: #3660a9;
      font-weight: 700;
    }

    .category-item.selected .cat-icon i,
    .category-item.selected .dot-indicator {
      color: #3660a9;
      background-color: #3660a9;
    }

    /* Hover state */
    .category-item:hover {
      background-color: #f3f4f6;
      color: #3660a9;
    }

    .category-item.root-item:hover {
      background-color: #eef2fb;
    }

    /* Root icon */
    .cat-icon {
      width: 20px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cat-icon i {
      font-size: 13px;
      color: #9ca3af;
      transition: color 0.15s;
    }

    .category-item.expanded .cat-icon i,
    .category-item:hover .cat-icon i {
      color: #3660a9;
    }

    /* Dot indicator for sub-items */
    .dot-indicator {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background-color: #d1d5db;
      flex-shrink: 0;
      margin-left: 4px;
      transition: background-color 0.15s;
    }

    .category-item:hover .dot-indicator,
    .category-item.expanded .dot-indicator {
      background-color: #3660a9;
    }

    /* Name */
    .category-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Chevron */
    .chevron {
      width: 14px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
    }

    .chevron.open {
      transform: rotate(0deg);
    }

    .chevron:not(.open) {
      transform: rotate(-90deg);
    }

    .chevron i {
      font-size: 9px;
      color: #9ca3af;
      transition: color 0.15s;
    }

    .category-item:hover .chevron i,
    .category-item.expanded .chevron i {
      color: #3660a9;
    }

    /* Children container */
    .category-children {
      margin-left: 16px;
      padding-left: 8px;
      border-left: 2px solid #e5e7eb;
      margin-top: 2px;
      margin-bottom: 4px;
    }
  `]
})
export class CategoryNodeComponent implements OnInit {
  @Input() cat!: CategorieTree;
  @Input() level: number = 0;
  @Input() defaultExpanded: boolean = false;
  expanded = false;

  private filterService = inject(FilterService);

  get isSelected(): boolean {
    return !!this.cat._id && this.filterService.currentCategorie === this.cat._id;
  }

  ngOnInit(): void {
    this.expanded = this.defaultExpanded;
  }

  toggle(): void {
    if (this.cat.children && this.cat.children.length > 0) {
      this.expanded = !this.expanded;
    }
  }

  select(): void {
    this.toggle();
    if (this.cat._id) {
      const newId = this.filterService.currentCategorie === this.cat._id ? '' : this.cat._id;
      this.filterService.setCategorie(newId);
    }
  }
}

