import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ProduitService, Produit } from '../../services/produit.service';
import { CategorieService, Categorie } from '../../../categories/services/categorie.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-produit-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './produit-list.component.html',
  styleUrls: ['./produit-list.component.scss'],
})
export class ProduitListComponent implements OnInit {
  produits: Produit[] = [];
  filteredProduits: Produit[] = [];
  searchTerm = '';
  filterStatut = '';
  showModal = false;
  editingProduit: Produit | null = null;
  isSubmitting = false;
  produitForm: FormGroup;
  categories: Categorie[] = [];

  constructor(
    private produitService: ProduitService,
    private categorieService: CategorieService,
    private formBuilder: FormBuilder,
    private toastService: ToastService
  ) {
    this.produitForm = this.formBuilder.group({
      idCategorie: ['', [Validators.required]],
      nom: ['', [Validators.required]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
      description: [''],
      prix: this.formBuilder.group({
        devise: ['EUR', [Validators.required]],
        montant: [0, [Validators.required, Validators.min(0)]],
      }),
      stock: this.formBuilder.group({
        quantite: [0, [Validators.required, Validators.min(0)]],
      }),
      images: [[]],
      attributs: this.formBuilder.group({
        couleur: [''],
        taille: [[]],
        marque: [''],
      }),
      statut: ['actif'],
    });
  }

  ngOnInit() {
    this.loadProduits();
    this.loadCategories();
  }

  loadProduits() {
    this.produitService.getProduitsByBoutique().subscribe({
      next: (data) => {
        this.produits = data;
        this.filteredProduits = this.produits;
        if (this.searchTerm) {
          this.filterProduits();
        }
      },
    });
  }

  loadCategories() {
    this.categorieService.getCategoriesByBoutique().subscribe({
      next: (data) => {
        this.categories = data;
      },
    });
  }

  filterProduits() {
    this.filteredProduits = this.produits.filter(
      (produit) =>
        produit.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (produit.description && produit.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  filterByStatut() {
    if (this.filterStatut) {
      this.filteredProduits = this.produits.filter(p => p.statut === this.filterStatut);
    } else {
      this.filteredProduits = this.produits;
    }
  }

  resetFilters() {
    this.searchTerm = '';
    this.filterStatut = '';
    this.filteredProduits = this.produits;
  }

  openCreateModal() {
    this.editingProduit = null;
    this.produitForm.reset();
    this.produitForm.patchValue({
      prix: { devise: 'EUR', montant: 0 },
      stock: { quantite: 0 },
      statut: 'actif',
      attributs: { couleur: '', taille: [], marque: '' }
    });
    this.showModal = true;
  }

  generateSlug() {
    const nom = this.produitForm.get('nom')?.value;
    if (nom) {
      const slug = nom
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      this.produitForm.patchValue({ slug });
    }
  }

  editProduit(produit: Produit) {
    this.editingProduit = produit;
    this.produitForm.patchValue({
      idCategorie: typeof produit.idCategorie === 'string' ? produit.idCategorie : produit.idCategorie._id,
      nom: produit.nom,
      slug: produit.slug,
      description: produit.description || '',
      prix: produit.prix,
      stock: produit.stock,
      images: produit.images || [],
      attributs: {
        couleur: produit.attributs?.couleur || '',
        taille: produit.attributs?.taille || [],
        marque: produit.attributs?.marque || '',
      },
      statut: produit.statut,
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingProduit = null;
    this.produitForm.reset();
  }

  addTaille() {
    const tailles = this.produitForm.get('attributs.taille')?.value || [];
    tailles.push('');
    this.produitForm.get('attributs')?.patchValue({ taille: tailles });
  }

  removeTaille(index: number) {
    const tailles = this.produitForm.get('attributs.taille')?.value || [];
    tailles.splice(index, 1);
    this.produitForm.get('attributs')?.patchValue({ taille: tailles });
  }

  addImageUrl() {
    const images = this.produitForm.get('images')?.value || [];
    images.push('');
    this.produitForm.get('images')?.patchValue({ images });
  }

  removeImageUrl(index: number) {
    const images = this.produitForm.get('images')?.value || [];
    images.splice(index, 1);
    this.produitForm.get('images')?.patchValue({ images });
  }

  onSubmit() {
    if (this.produitForm.valid) {
      this.isSubmitting = true;
      const produitData = this.produitForm.value;

      if (this.editingProduit) {
        this.produitService.updateProduit(this.editingProduit._id!, produitData).subscribe({
          next: () => {
            this.loadProduits();
            this.closeModal();
            this.isSubmitting = false;
            this.toastService.showSuccess('Produit modifié avec succès!');
          },
          error: () => {
            this.isSubmitting = false;
            this.toastService.showError('Erreur lors de la modification du produit');
          },
        });
      } else {
        this.produitService.createProduit(produitData).subscribe({
          next: () => {
            this.loadProduits();
            this.closeModal();
            this.isSubmitting = false;
            this.toastService.showSuccess('Produit créé avec succès!');
          },
          error: () => {
            this.isSubmitting = false;
            this.toastService.showError('Erreur lors de la création du produit');
          },
        });
      }
    }
  }

  deleteProduit(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.produitService.deleteProduit(id).subscribe({
        next: () => {
          this.loadProduits();
          this.toastService.showSuccess('Produit supprimé avec succès!');
        },
        error: () => {
          this.toastService.showError('Erreur lors de la suppression du produit');
        }
      });
    }
  }

  getStatutBadgeClass(statut: string): string {
    switch (statut) {
      case 'actif':
        return 'statut-actif';
      case 'rupture_stock':
        return 'statut-rupture_stock';
      case 'archive':
        return 'statut-archive';
      default:
        return '';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'actif':
        return 'Actif';
      case 'rupture_stock':
        return 'Rupture de stock';
      case 'archive':
        return 'Archivé';
      default:
        return statut;
    }
  }
}
