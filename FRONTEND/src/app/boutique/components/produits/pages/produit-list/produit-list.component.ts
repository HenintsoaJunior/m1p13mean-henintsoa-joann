import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ProduitService, Produit } from '../../services/produit.service';
import {
  CategorieService,
  Categorie,
  CategorieTree,
  CategorieFormData,
} from '../../../categories/services/categorie.service';
import { ToastService } from '../../../../../services/toast.service';
import { CouleurService } from '../../services/couleur.service';
import { MarqueService } from '../../services/marque.service';
import { TailleService } from '../../services/taille.service';
import { Couleur, Marque, Taille } from '../../models/boutique.models';

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

  // Pagination
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];

  get totalItems(): number { return this.filteredProduits.length; }
  get totalPages(): number { return Math.ceil(this.totalItems / this.pageSize) || 1; }
  get paginatedProduits(): Produit[] {
    return this.filteredProduits.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
  }
  get pages(): number[] {
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) { this.currentPage = page; }
  }
  onPageSizeChange(): void { this.currentPage = 1; }
  filterStatut = '';
  showCategorieModal = false;
  showProduitModal = false;
  showDeleteConfirm = false;
  selectedProduit: Produit | null = null;
  produitASupprimer: Produit | null = null;
  currentImageIndex = 0;
  isCreatingCategorie = false;
  isDeleting = false;
  categorieForm: FormGroup;
  categories: Categorie[] = [];
  categoriesTree: CategorieTree[] = [];
  flattenedCategories: { cat: CategorieTree; level: number; indent: string }[] = [];

  // Données pour les attributs
  couleurs: Couleur[] = [];
  marques: Marque[] = [];
  tailles: Taille[] = [];

  constructor(
    private produitService: ProduitService,
    private categorieService: CategorieService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private router: Router,
    private couleurService: CouleurService,
    private marqueService: MarqueService,
    private tailleService: TailleService,
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
    this.loadAttributsData();
  }

  loadAttributsData() {
    // Charger les couleurs, marques et tailles pour l'affichage
    this.couleurService.getAllCouleurs(true).subscribe({
      next: (data) => {
        this.couleurs = data.couleurs;
      },
      error: () => {},
    });

    this.marqueService.getAllMarques(true).subscribe({
      next: (data) => {
        this.marques = data.marques;
      },
      error: () => {},
    });

    this.tailleService.getAllTailles(true).subscribe({
      next: (data) => {
        this.tailles = data.tailles;
      },
      error: () => {},
    });
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
  flattenCategories(
    tree: CategorieTree[],
    level: number = 0,
  ): { cat: CategorieTree; level: number; indent: string }[] {
    let result: { cat: CategorieTree; level: number; indent: string }[] = [];
    for (const cat of tree) {
      result.push({
        cat,
        level,
        indent: '  '.repeat(level),
      });
      if (cat.children && cat.children.length > 0) {
        result = result.concat(this.flattenCategories(cat.children, level + 1));
      }
    }
    return result;
  }

  getFlattenedCategories(): { cat: CategorieTree; level: number; indent: string }[] {
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
    this.currentPage = 1;
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

  // Confirmation de suppression
  confirmDeleteProduit(produit: Produit) {
    this.produitASupprimer = produit;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.produitASupprimer = null;
    this.isDeleting = false;
  }

  executeDelete() {
    if (!this.produitASupprimer?._id) return;

    this.isDeleting = true;
    this.produitService.deleteProduit(this.produitASupprimer._id).subscribe({
      next: () => {
        this.loadProduits();
        this.showDeleteConfirm = false;
        this.closeProduitModal();
        this.produitASupprimer = null;
        this.isDeleting = false;
      },
      error: () => {
        this.toastService.showError('Erreur lors de la suppression du produit');
        this.isDeleting = false;
      },
    });
  }

  // Méthodes pour afficher les vrais noms des attributs
  getCouleurName(couleurId: string): string {
    const couleur = this.couleurs.find((c) => c._id === couleurId);
    return couleur ? couleur.nom : couleurId;
  }

  getCouleurHex(couleurId: string): string {
    const couleur = this.couleurs.find((c) => c._id === couleurId);
    return couleur ? couleur.codeHex : '#cccccc';
  }

  getFirstCouleurHex(produit: Produit): string {
    if (!produit.attributs?.couleurs?.length) return '#cccccc';
    return this.getCouleurHex(produit.attributs.couleurs[0]);
  }

  getMarqueName(marqueId: string): string {
    const marque = this.marques.find((m) => m._id === marqueId);
    return marque ? marque.nom : marqueId;
  }

  getTailleName(tailleId: string): string {
    const taille = this.tailles.find((t) => t._id === tailleId);
    return taille ? taille.label || taille.valeur : tailleId;
  }

  getAttributsDisplay(produit: Produit): { couleurs?: string; tailles?: string; marque?: string } {
    const result: { couleurs?: string; tailles?: string; marque?: string } = {};

    if (produit.attributs?.couleurs && produit.attributs.couleurs.length > 0) {
      result.couleurs = produit.attributs.couleurs.map((id) => this.getCouleurName(id)).join(', ');
    }

    if (produit.attributs?.tailles && produit.attributs.tailles.length > 0) {
      result.tailles = produit.attributs.tailles.map((id) => this.getTailleName(id)).join(', ');
    }

    if (produit.attributs?.marque) {
      const marqueId =
        typeof produit.attributs.marque === 'string'
          ? produit.attributs.marque
          : produit.attributs.marque._id;
      result.marque = this.getMarqueName(marqueId);
    }

    return result;
  }

  // Méthodes pour obtenir le prix et le stock depuis les variantes
  getProduitPrix(produit: Produit): number {
    if (produit.variantes && produit.variantes.length > 0) {
      return produit.variantes[0].prix.montant || 0;
    }
    return 0;
  }

  getProduitStock(produit: Produit): number {
    if (produit.variantes && produit.variantes.length > 0) {
      return produit.variantes.reduce((total, v) => total + (v.stock.quantite || 0), 0);
    }
    return 0;
  }

  // Navigation des images
  previousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  nextImage(): void {
    if (this.selectedProduit && this.currentImageIndex < this.selectedProduit.images!.length - 1) {
      this.currentImageIndex++;
    }
  }
}
