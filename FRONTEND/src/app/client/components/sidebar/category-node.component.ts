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
      >
        <!-- Checkbox multi-sélection -->
        <span
          class="cat-checkbox"
          (click)="toggleSelect($event)"
          [class.checked]="isSelected"
          *ngIf="cat._id"
          title="Filtrer par cette catégorie"
        >
          <i class="fas fa-check" *ngIf="isSelected"></i>
        </span>

        <!-- Icon for root items (no checkbox) -->
        <span *ngIf="level === 0 && !cat._id" class="cat-icon">
          <i class="fas fa-layer-group"></i>
        </span>

        <!-- Dot indicator for sub-items (no checkbox) -->
        <span *ngIf="level > 0 && !cat._id" class="dot-indicator"></span>

        <!-- Name — click to expand/collapse if has children -->
        <span
          class="category-name"
          [title]="cat.nom"
          (click)="toggle()"
          [class.clickable]="cat.children && cat.children.length > 0"
        >{{ cat.nom }}</span>

        <!-- Chevron for items with children -->
        <span
          *ngIf="cat.children && cat.children.length > 0"
          class="chevron"
          [class.open]="expanded"
          (click)="toggle()"
        >
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
    :host { display: block; width: 100%; }
    .category-node { width: 100%; }

    .category-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px 6px 10px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 400;
      color: #4b5563;
      transition: background 0.15s ease, color 0.15s ease;
      user-select: none;
      line-height: 1.4;
      margin-bottom: 1px;
    }
    .category-item:hover { background-color: #f3f4f6; }
    .category-item.root-item { font-weight: 600; font-size: 13.5px; color: #1f2937; }
    .category-item.root-item:hover { background-color: #eef2fb; }
    .category-item.selected { background-color: #eef2fb; }

    /* Checkbox */
    .cat-checkbox {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      border: 2px solid #d1d5db;
      flex-shrink: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
      background: white;
    }
    .cat-checkbox:hover { border-color: #3660a9; }
    .cat-checkbox.checked {
      background: #3660a9;
      border-color: #3660a9;
    }
    .cat-checkbox i { font-size: 9px; color: white; }

    /* Root icon */
    .cat-icon {
      width: 20px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .cat-icon i { font-size: 13px; color: #9ca3af; }

    /* Dot indicator for sub-items */
    .dot-indicator {
      width: 5px; height: 5px; border-radius: 50%;
      background-color: #d1d5db; flex-shrink: 0; margin-left: 4px;
    }

    /* Name */
    .category-name {
      flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      color: #4b5563;
    }
    .category-name.clickable { cursor: pointer; }
    .category-name.clickable:hover { color: #3660a9; }
    .category-item.selected .category-name { color: #3660a9; font-weight: 600; }

    /* Chevron */
    .chevron {
      width: 14px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s ease; cursor: pointer;
    }
    .chevron.open { transform: rotate(0deg); }
    .chevron:not(.open) { transform: rotate(-90deg); }
    .chevron i { font-size: 9px; color: #9ca3af; }
    .chevron:hover i { color: #3660a9; }

    /* Children */
    .category-children {
      margin-left: 20px; padding-left: 8px;
      border-left: 2px solid #e5e7eb;
      margin-top: 2px; margin-bottom: 4px;
    }
  `]
})
export class CategoryNodeComponent implements OnInit {
  @Input() cat!: CategorieTree;
  @Input() level: number = 0;
  @Input() defaultExpanded: boolean = false;
  expanded = false;

  filterService = inject(FilterService);

  get isSelected(): boolean {
    return !!this.cat._id && this.filterService.isSelected(this.cat._id);
  }

  ngOnInit(): void { this.expanded = this.defaultExpanded; }

  toggle(): void {
    if (this.cat.children && this.cat.children.length > 0) {
      this.expanded = !this.expanded;
    }
  }

  toggleSelect(event: Event): void {
    event.stopPropagation();
    if (this.cat._id) {
      this.filterService.toggleCategorie(this.cat._id, this.cat.nom);
    }
  }
}

