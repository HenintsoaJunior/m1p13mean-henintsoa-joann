import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ProduitService } from '../../services/produit.service';
import { CategorieService, Categorie, CategorieTree, CategorieFormData } from '../../../categories/services/categorie.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-produit-create',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './produit-create.component.html',
  styleUrls: ['./produit-create.component.scss'],
})
export class ProduitCreateComponent implements OnInit {
  isSubmitting = false;
  showCategorieModal = false;
  isCreatingCategorie = false;
  showCategoryDropdown = false;
  produitForm: FormGroup;
  categorieForm: FormGroup;
  categories: Categorie[] = [];
  categoriesTree: CategorieTree[] = [];
  flattenedCategories: { cat: CategorieTree, level: number, indent: string }[] = [];
  selectedCategories: string[] = [];

  constructor(
    private produitService: ProduitService,
    private categorieService: CategorieService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
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

    this.categorieForm = this.formBuilder.group({
      nom: ['', [Validators.required]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
      description: [''],
      idCategorieParent: [null],
      urlImage: [''],
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadCategoriesTree();
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.categorie-multi-select-container')) {
      this.closeCategoryDropdown();
    }
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
          this.categoriesTree = data.arbre || data.data || data.categories || [];
          console.log('✅ Categories tree loaded (from object):', this.categoriesTree);
        } else {
          this.categoriesTree = [];
          console.warn('⚠️ No categories tree data found');
        }
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

  toggleCategoryDropdown() {
    this.showCategoryDropdown = !this.showCategoryDropdown;
  }

  closeCategoryDropdown() {
    this.showCategoryDropdown = false;
  }

  toggleCategorySelection(categorieId: string) {
    const index = this.selectedCategories.indexOf(categorieId);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(categorieId);
    }
    this.updateFormValue();
  }

  isCategorySelected(categorieId: string): boolean {
    return this.selectedCategories.includes(categorieId);
  }

  updateFormValue() {
    this.produitForm.patchValue({
      idCategorie: this.selectedCategories.join(',')
    });
  }

  getSelectedCategoriesNames(): string {
    if (this.selectedCategories.length === 0) {
      return 'Sélectionner des catégories';
    }
    const names: string[] = [];
    for (const item of this.flattenedCategories) {
      if (this.selectedCategories.includes(item.cat._id!)) {
        names.push(item.cat.nom);
      }
    }
    return names.join(', ');
  }

  getSelectedCount(): number {
    return this.selectedCategories.length;
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

  openCategorieModal() {
    const selectedCategorie = this.produitForm.get('idCategorie')?.value;
    this.categorieForm.reset();
    this.categorieForm.patchValue({
      idCategorieParent: selectedCategorie || null,
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

  addTaille() {
    const tailles = [...(this.produitForm.get('attributs.taille')?.value || [])];
    tailles.push('');
    this.produitForm.get('attributs.taille')?.setValue(tailles);
  }

  removeTaille(index: number) {
    const tailles = [...(this.produitForm.get('attributs.taille')?.value || [])];
    tailles.splice(index, 1);
    this.produitForm.get('attributs.taille')?.setValue(tailles);
  }

  addImageUrl() {
    const images = [...(this.produitForm.get('images')?.value || [])];
    images.push('');
    this.produitForm.get('images')?.setValue(images);
  }

  removeImageUrl(index: number) {
    const images = [...(this.produitForm.get('images')?.value || [])];
    images.splice(index, 1);
    this.produitForm.get('images')?.setValue(images);
  }

  onSubmit() {
    if (this.produitForm.valid) {
      this.isSubmitting = true;
      const produitData = this.produitForm.value;

      this.produitService.createProduit(produitData).subscribe({
        next: () => {
          this.toastService.showSuccess('Produit créé avec succès!');
          this.router.navigate(['/boutique/produits']);
          this.isSubmitting = false;
        },
        error: () => {
          this.isSubmitting = false;
          this.toastService.showError('Erreur lors de la création du produit');
        },
      });
    }
  }

  onCancel() {
    this.router.navigate(['/boutique/produits']);
  }
}
