import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProduitService } from '../../services/produit.service';
import { CategorieService } from '../../../categories/services/categorie.service';
import { Produit, ProduitFormData, Categorie } from '../../models/boutique.models';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-produit-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './produit-form.component.html',
  styleUrls: ['./produit-form.component.scss'],
})
export class ProduitFormComponent implements OnInit {
  private produitService = inject(ProduitService);
  private categorieService = inject(CategorieService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = false;
  loading = false;
  submitting = false;
  categories: Categorie[] = [];

  form: ProduitFormData = {
    idCategorie: '',
    nom: '',
    slug: '',
    description: '',
    prix: {
      devise: 'EUR',
      montant: 0,
    },
    stock: {
      quantite: 0,
    },
    images: [],
    attributs: {
      couleur: '',
      taille: [],
      marque: '',
    },
    statut: 'actif',
  };

  ngOnInit(): void {
    this.loadCategories();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadProduit(id);
    }
  }

  loadCategories(): void {
    this.categorieService.getCategoriesByBoutique().subscribe({
      next: (data) => {
        this.categories = data;
      },
    });
  }

  loadProduit(id: string): void {
    this.loading = true;
    this.produitService.getProduitById(id).subscribe({
      next: (produit) => {
        this.form = {
          idCategorie: typeof produit.idCategorie === 'string' ? produit.idCategorie : produit.idCategorie._id,
          nom: produit.nom,
          slug: produit.slug,
          description: produit.description || '',
          prix: { ...produit.prix },
          stock: { ...produit.stock },
          images: produit.images || [],
          attributs: {
            couleur: produit.attributs?.couleur || '',
            taille: produit.attributs?.taille || [],
            marque: produit.attributs?.marque || '',
          },
          statut: produit.statut,
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

  addTaille(): void {
    if (!this.form.attributs) {
      this.form.attributs = { taille: [] };
    }
    if (!this.form.attributs.taille) {
      this.form.attributs.taille = [];
    }
    this.form.attributs.taille.push('');
  }

  removeTaille(index: number): void {
    this.form.attributs?.taille?.splice(index, 1);
  }

  onTailleChange(index: number, value: string): void {
    if (this.form.attributs?.taille) {
      this.form.attributs.taille[index] = value;
    }
  }

  addImageUrl(): void {
    if (!this.form.images) {
      this.form.images = [];
    }
    this.form.images.push('');
  }

  removeImageUrl(index: number): void {
    this.form.images?.splice(index, 1);
  }

  onImageUrlChange(index: number, value: string): void {
    if (this.form.images) {
      this.form.images[index] = value;
    }
  }

  onSubmit(): void {
    if (!this.form.nom || !this.form.slug || !this.form.idCategorie) {
      this.toastService.showError('Veuillez remplir les champs obligatoires');
      return;
    }

    this.submitting = true;

    if (this.isEditMode) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.produitService.updateProduit(id, this.form).subscribe({
          next: () => {
            this.submitting = false;
            this.router.navigate(['/boutique/produits']);
          },
          error: () => {
            this.submitting = false;
          },
        });
      }
    } else {
      this.produitService.createProduit(this.form).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/boutique/produits']);
        },
        error: () => {
          this.submitting = false;
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/boutique/produits']);
  }
}
