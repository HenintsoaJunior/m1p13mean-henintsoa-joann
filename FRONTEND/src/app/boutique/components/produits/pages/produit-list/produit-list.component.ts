import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProduitService, Produit } from '../../services/produit.service';
import { CategorieService, Categorie, CategorieTree, CategorieFormData } from '../../../categories/services/categorie.service';
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
  showCategorieModal = false;
  showProduitModal = false;
  selectedProduit: Produit | null = null;
  currentImageIndex = 0;
  isCreatingCategorie = false;
  categorieForm: FormGroup;
  categories: Categorie[] = [];
  categoriesTree: CategorieTree[] = [];
  flattenedCategories: { cat: CategorieTree, level: number, indent: string }[] = [];

  constructor(
    private produitService: ProduitService,
    private categorieService: CategorieService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private router: Router,
  ) {
    this.categorieForm = this.formBuilder.group({
      nom: ['', [Validators.required]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
      description: [''],
      idCategorieParent: [null],
      urlImage: [''],
    });
  }

  ngOnInit() {
    this.loadProduits();
    this.loadCategories();
    this.loadCategoriesTree();
  }

  loadCategoriesTree() {
    this.categorieService.getCategoriesTree().subscribe({
      next: (data: any) => {
        console.log('🌳 Categories Tree API Response:', data);
        if (data && Array.isArray(data.arbre)) {
          this.categoriesTree = data.arbre;
          console.log('✅ Categories tree loaded (from arbre):', this.categoriesTree);
        } else if (Array.isArray(data)) {
          this.categoriesTree = data;
          console.log('✅ Categories tree loaded (direct array):', this.categoriesTree);
        } else if (data && typeof data === 'object') {
          // Le backend peut retourner un objet avec d'autres propriétés
          this.categoriesTree = data.arbre || data.data || data.categories || [];
          console.log('✅ Categories tree loaded (from object):', this.categoriesTree);
        } else {
          this.categoriesTree = [];
          console.warn('⚠️ No categories tree data found');
        }
        // Rafraîchir les catégories aplaties après chargement
        this.refreshFlattenedCategories();
      },
      error: (error) => {
        console.error('❌ Error loading categories tree:', error);
        this.categoriesTree = [];
        this.refreshFlattenedCategories();
      },
    });
  }

  refreshFlattenedCategories() {
    this.flattenedCategories = this.flattenCategories(this.categoriesTree);
  }

  // Méthode utilitaire pour aplatir l'arbre des catégories
  flattenCategories(tree: CategorieTree[], level: number = 0): { cat: CategorieTree, level: number, indent: string }[] {
    let result: { cat: CategorieTree, level: number, indent: string }[] = [];
    for (const cat of tree) {
      result.push({
        cat,
        level,
        indent: '  '.repeat(level)
      });
      if (cat.children && cat.children.length > 0) {
        result = result.concat(this.flattenCategories(cat.children, level + 1));
      }
    }
    return result;
  }

  getFlattenedCategories(): { cat: CategorieTree, level: number, indent: string }[] {
    return this.flattenedCategories;
  }

  loadProduits() {
    this.produitService.getProduitsByBoutique().subscribe({
      next: (data: any) => {
        // CORRECTION : le backend peut retourner un objet paginé { data: [], total: ... }
        // ou directement un tableau — on normalise dans les deux cas
        if (Array.isArray(data)) {
          this.produits = data;
        } else if (data && Array.isArray(data.data)) {
          this.produits = data.data;
        } else if (data && Array.isArray(data.produits)) {
          this.produits = data.produits;
        } else if (data && Array.isArray(data.items)) {
          this.produits = data.items;
        } else {
          this.produits = [];
        }
        this.applyFilters();
      },
      error: () => {
        this.produits = [];
        this.filteredProduits = [];
      },
    });
  }

  loadCategories() {
    this.categorieService.getCategoriesByBoutique().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.categories = data;
        } else if (data && Array.isArray(data.data)) {
          this.categories = data.data;
        } else {
          this.categories = [];
        }
      },
      error: () => {
        this.categories = [];
      },
    });
  }

  applyFilters() {
    if (!Array.isArray(this.produits)) {
      this.filteredProduits = [];
      return;
    }
    this.filteredProduits = this.produits.filter((produit) => {
      const matchSearch =
        !this.searchTerm ||
        produit.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (produit.description &&
          produit.description.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchStatut = !this.filterStatut || produit.statut === this.filterStatut;

      return matchSearch && matchStatut;
    });
  }

  filterProduits() {
    this.applyFilters();
  }

  filterByStatut() {
    this.applyFilters();
  }

  resetFilters() {
    this.searchTerm = '';
    this.filterStatut = '';
    this.applyFilters();
  }

  onCreateCategorieSubmit() {
    if (this.categorieForm.valid) {
      this.isCreatingCategorie = true;
      const categorieData: CategorieFormData = this.categorieForm.value;

      this.categorieService.createCategorie(categorieData).subscribe({
        next: () => {
          this.loadCategoriesTree();
          this.closeCategorieModal();
          this.isCreatingCategorie = false;
          this.toastService.showSuccess('Catégorie créée avec succès!');
        },
        error: () => {
          this.isCreatingCategorie = false;
          this.toastService.showError('Erreur lors de la création de la catégorie');
        },
      });
    }
  }

  openCategorieModal() {
    this.categorieForm.reset();
    this.categorieForm.patchValue({
      idCategorieParent: null,
    });
    this.showCategorieModal = true;
  }

  closeCategorieModal() {
    this.showCategorieModal = false;
    this.categorieForm.reset();
  }

  generateCategorieSlug() {
    const nom = this.categorieForm.get('nom')?.value;
    if (nom) {
      const slug = nom
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      this.categorieForm.patchValue({ slug });
    }
  }

  editProduit(produit: Produit) {
    this.closeProduitModal();
    // Rediriger vers la page d'édition
    this.router.navigate(['/boutique/produits/edit', produit._id]);
  }

  viewProduit(produit: Produit) {
    this.selectedProduit = produit;
    this.currentImageIndex = 0;
    this.showProduitModal = true;
  }

  closeProduitModal() {
    this.showProduitModal = false;
    this.selectedProduit = null;
    this.currentImageIndex = 0;
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
        },
      });
    }
  }
}
