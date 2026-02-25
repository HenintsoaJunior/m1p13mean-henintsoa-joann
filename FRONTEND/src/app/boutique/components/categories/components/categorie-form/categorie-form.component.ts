import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategorieService } from '../../services/categorie.service';
import { Categorie, CategorieFormData } from '../../models/boutique.models';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-categorie-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './categorie-form.component.html',
  styleUrls: ['./categorie-form.component.scss'],
})
export class CategorieFormComponent implements OnInit {
  private categorieService = inject(CategorieService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = false;
  loading = false;
  submitting = false;
  categories: Categorie[] = [];
  currentId: string | null = null;

  form: CategorieFormData = {
    nom: '',
    slug: '',
    description: '',
    idCategorieParent: '',
    urlImage: '',
  };

  ngOnInit(): void {
    this.loadCategories();
    this.currentId = this.route.snapshot.paramMap.get('id');
    if (this.currentId) {
      this.isEditMode = true;
      this.loadCategorie(this.currentId);
    }
  }

  loadCategories(): void {
    this.categorieService.getCategoriesByBoutique().subscribe({
      next: (data) => {
        this.categories = data;
      },
    });
  }

  loadCategorie(id: string): void {
    this.loading = true;
    this.categorieService.getCategorieById(id).subscribe({
      next: (categorie) => {
        this.form = {
          nom: categorie.nom,
          slug: categorie.slug,
          description: categorie.description || '',
          idCategorieParent: categorie.idCategorieParent || '',
          urlImage: categorie.urlImage || '',
        };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  generateSlug(): void {
    if (this.form.nom) {
      this.form.slug = this.form.nom
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
  }

  onSubmit(): void {
    if (!this.form.nom || !this.form.slug) {
      this.toastService.showError('Veuillez remplir les champs obligatoires');
      return;
    }

    this.submitting = true;

    if (this.isEditMode) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.categorieService.updateCategorie(id, this.form).subscribe({
          next: () => {
            this.submitting = false;
            this.router.navigate(['/boutique/categories']);
          },
          error: () => {
            this.submitting = false;
          },
        });
      }
    } else {
      this.categorieService.createCategorie(this.form).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/boutique/categories']);
        },
        error: () => {
          this.submitting = false;
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/boutique/categories']);
  }
}
