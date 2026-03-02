import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ClientCategorieService, CategorieTree } from '../../client/services/categorie.service';
import { CategoryNodeComponent } from '../../client/components/sidebar/category-node.component';
import { FilterService } from '../../client/services/filter.service';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, CategoryNodeComponent],
  templateUrl: './client-layout.component.html',
  styleUrl: './client-layout.component.scss'
})
export class ClientLayoutComponent implements OnInit {
  categoriesTree: CategorieTree[] = [];

  constructor(
    private categorieService: ClientCategorieService,
    private filterService: FilterService
  ) {}

  get selectedCount(): number { return this.filterService.selectedCategories.length; }

  resetCategorie(): void { this.filterService.clearCategories(); }

  ngOnInit(): void {
    this.categorieService.getCategoriesArbre().subscribe({
      next: (data: any) => {
        console.log('📦 categories raw data:', data);
        if (data && Array.isArray(data.arbre)) {
          this.categoriesTree = data.arbre;
        } else if (Array.isArray(data)) {
          this.categoriesTree = data;
        } else {
          this.categoriesTree = data?.arbre || data?.categories || [];
        }
        console.log('🌳 categoriesTree:', this.categoriesTree);
      },
      error: (err) => {
        console.error('❌ categories error:', err);
        this.categoriesTree = [];
      }
    });
  }
}
