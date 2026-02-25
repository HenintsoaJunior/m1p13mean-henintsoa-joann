import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategorieService } from '../../services/categorie.service';
import { Categorie } from '../../models/boutique.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-categorie-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './categorie-list.component.html',
  styleUrls: ['./categorie-list.component.scss'],
})
export class CategorieListComponent implements OnInit {
  private categorieService = inject(CategorieService);

  categories: Categorie[] = [];
  loading = false;
  searchTerm = '';

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categorieService.getCategoriesByBoutique().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  filterCategories(): void {
    if (this.searchTerm.trim()) {
      this.categories = this.categories.filter(c =>
        c.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    } else {
      this.loadCategories();
    }
  }

  deleteCategorie(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      this.categorieService.deleteCategorie(id).subscribe({
        next: () => {
          this.categories = this.categories.filter((c) => c._id !== id);
        },
        error: () => {
          // Error handled by service
        },
      });
    }
  }

  hasChildren(id: string): boolean {
    return this.categories.some((c) => c.idCategorieParent === id);
  }

  getParentName(id: string | null | undefined): string {
    if (!id) return '-';
    const parent = this.categories.find((c) => c._id === id);
    return parent ? parent.nom : 'Parent supprimé';
  }
}
