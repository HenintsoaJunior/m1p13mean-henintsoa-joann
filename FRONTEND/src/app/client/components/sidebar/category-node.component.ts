import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategorieTree } from '../../services/categorie.service';

@Component({
  selector: 'app-category-node',
  standalone: true,
  imports: [CommonModule, CategoryNodeComponent],
  template: `
    <div class="category-node">
      <div
        class="category-item"
        [class.expanded]="expanded"
        [class.root-item]="level === 0"
        [class.leaf-item]="!cat.children || cat.children.length === 0"
        [style.padding-left.px]="12 + level * 16"
        (click)="toggle()"
      >
        <!-- Folder / leaf icon -->
        <span class="cat-icon">
          <i *ngIf="cat.children && cat.children.length > 0"
             class="fas"
             [class.fa-folder-open]="expanded"
             [class.fa-folder]="!expanded"></i>
          <i *ngIf="!cat.children || cat.children.length === 0"
             class="fas fa-tag"></i>
        </span>

        <!-- Name -->
        <span class="category-name" [title]="cat.nom">{{ cat.nom }}</span>

        <!-- Chevron -->
        <span *ngIf="cat.children && cat.children.length > 0" class="chevron">
          <i class="fas" [class.fa-chevron-down]="expanded" [class.fa-chevron-right]="!expanded"></i>
        </span>
      </div>

      <!-- Children -->
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
    .category-node {
      width: 100%;
    }

    .category-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-top: 8px;
      padding-bottom: 8px;
      padding-right: 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      color: #495057;
      transition: background-color 0.15s, color 0.15s, border-color 0.15s;
      user-select: none;
      position: relative;
    }

    /* Root level */
    .category-item.root-item {
      font-weight: 700;
      font-size: 13px;
      color: #212529;
      letter-spacing: 0.01em;
    }

    /* Hover */
    .category-item:hover {
      background-color: #eef2fb;
      color: #3660a9;
    }

    .category-item:hover .cat-icon i {
      color: #3660a9;
    }

    /* Expanded state */
    .category-item.expanded {
      background-color: #e6edfa;
      color: #3660a9;
      font-weight: 600;
    }

    .category-item.expanded .cat-icon i {
      color: #3660a9;
    }

    /* Leaf item */
    .category-item.leaf-item:hover {
      background-color: #f5f7ff;
      color: #3660a9;
    }

    /* Icon */
    .cat-icon {
      width: 18px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cat-icon i {
      font-size: 12px;
      color: #868e96;
      transition: color 0.15s;
    }

    .category-item.root-item .cat-icon i {
      font-size: 13px;
      color: #3660a9;
    }

    .category-item.leaf-item .cat-icon i {
      font-size: 10px;
      color: #adb5bd;
    }

    /* Name */
    .category-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1.3;
    }

    /* Badge */
    .children-count {
      font-size: 10px;
      font-weight: 600;
      background-color: #dee2e6;
      color: #6c757d;
      border-radius: 10px;
      padding: 1px 6px;
      min-width: 18px;
      text-align: center;
      transition: background-color 0.15s, color 0.15s;
      flex-shrink: 0;
    }

    .category-item:hover .children-count,
    .category-item.expanded .children-count {
      background-color: #c5d3f0;
      color: #3660a9;
    }

    /* Chevron */
    .chevron {
      width: 12px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chevron i {
      font-size: 9px;
      color: #adb5bd;
      transition: color 0.15s, transform 0.2s;
    }

    .category-item:hover .chevron i,
    .category-item.expanded .chevron i {
      color: #3660a9;
    }

    /* Children container */
    .category-children {
      margin-left: 22px;
      border-left: 2px solid #e9ecef;
      padding-left: 2px;
      margin-top: 2px;
      margin-bottom: 2px;
    }
  `]
})
export class CategoryNodeComponent implements OnInit {
  @Input() cat!: CategorieTree;
  @Input() level: number = 0;
  @Input() defaultExpanded: boolean = false;
  expanded = false;

  ngOnInit(): void {
    this.expanded = this.defaultExpanded;
  }

  toggle(): void {
    if (this.cat.children && this.cat.children.length > 0) {
      this.expanded = !this.expanded;
    }
  }
}

