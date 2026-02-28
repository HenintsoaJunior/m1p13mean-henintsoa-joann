import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ProduitService } from '../../services/produit.service';
import {
  CategorieService,
  CategorieTree,
  CategorieFormData,
} from '../../../categories/services/categorie.service';
import { ToastService } from '../../../../../services/toast.service';

// ------------------------------------------------
// INTERFACES LOCALES
// ------------------------------------------------
export interface StepConfig {
  id: number;
  label: string;
  desc: string;
}

export interface ColorPreset {
  name: string;
  hex: string;
  display: string;
}

export interface StatusOption {
  value: string;
  label: string;
  sub: string;
}

export interface FlatCategory {
  cat: CategorieTree;
  level: number;
  indent: string;
}

export interface ProduitVariante {
  couleur: string;
  couleurHex: string;
  unite: string; // Renommé de taille à unite (peut être S, M, L, 75cl, 1kg, 1 carton, etc.)
  quantite: number;
}

export interface ColorSelection {
  name: string;
  hex: string;
}

// Options pour personnaliser le formulaire selon le type de produit
export interface ProduitOptions {
  avecCouleur: boolean;
  avecUnite: boolean;
  avecMarque: boolean;
  typeUnite: 'standard' | 'personnalise'; // standard (XS, S, M...) ou personnalisé (cl, kg, L, carton...)
}

// ------------------------------------------------
// COMPOSANT
// ------------------------------------------------
@Component({
  selector: 'app-produit-create',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './produit-create.component.html',
  styleUrls: ['./produit-create.component.scss'],
})
export class ProduitCreateComponent implements OnInit {
  // ── État du stepper ──────────────────────────
  currentStep = 1;

  steps: StepConfig[] = [
    { id: 1, label: 'Identité', desc: 'Nom & Catégories' },
    { id: 2, label: 'Prix & Stock', desc: 'Tarification' },
    { id: 3, label: 'Attributs', desc: 'Options & Variantes' },
    { id: 4, label: 'Récapitulatif', desc: 'Vérification' },
  ];

  get progressPercent(): number {
    return (this.currentStep / this.steps.length) * 100;
  }

  // ── États UI ─────────────────────────────────
  isSubmitting = false;
  isCreatingCategorie = false;
  showCategorieModal = false;
  slugFocused = false;
  priceFocused = false;
  descriptionLength = 0;

  // ── Formulaires ──────────────────────────────
  produitForm!: FormGroup;
  categorieForm!: FormGroup;

  // ── Catégories ───────────────────────────────
  categoriesTree: CategorieTree[] = [];
  flattenedCategories: FlatCategory[] = [];
  filteredRoots: CategorieTree[] = [];
  selectedCategories: string[] = [];
  activeRootId: string | null = null;
  categorySearchQuery = '';

  get activeRoot(): CategorieTree | undefined {
    return this.categoriesTree.find((c) => c._id === this.activeRootId);
  }

  // ── Statut ───────────────────────────────────
  selectedStatus = 'actif';

  statusOptions: StatusOption[] = [
    { value: 'actif', label: 'Actif', sub: 'Produit disponible' },
    { value: 'rupture_stock', label: 'Rupture de stock', sub: 'Temporairement indisponible' },
    { value: 'archive', label: 'Archivé', sub: 'Produit non affiché' },
  ];

  // ── Couleurs ─────────────────────────────────
  colorPresets: ColorPreset[] = [
    { name: 'Noir', hex: '#000000', display: '#000000' },
    { name: 'Blanc', hex: '#FFFFFF', display: '#FFFFFF' },
    { name: 'Rouge', hex: '#DC2626', display: '#DC2626' },
    { name: 'Vert', hex: '#059669', display: '#059669' },
    { name: 'Bleu', hex: '#3B82F6', display: '#3B82F6' },
    { name: 'Jaune', hex: '#FAB548', display: '#FAB548' },
  ];

  selectedColors: ColorSelection[] = []; // Multi-sélection de couleurs
  singleSelectedColor: ColorSelection | null = null; // Sélection unique pour variantes

  // ── Unités (anciennement Tailles) ──────────────────────────────────
  // Unités standards (vêtements)
  sizePresets: string[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  // Unités liquides (bouteilles, flacons...)
  liquidPresets: string[] = ['75cl', '100cl', '1L', '1.5L', '2L', '5L'];
  // Unités poids (kg, g...)
  weightPresets: string[] = ['100g', '250g', '500g', '1kg', '2kg', '5kg'];
  // Unités conditionnement (cartons, packs...)
  packagePresets: string[] = ['1 unité', '6 unités', '12 unités', '24 unités', '50 unités'];

  selectedSizes: string[] = [];
  singleSelectedSize: string = ''; // Sélection unique pour variantes
  singleSelectedStock: number = 0; // Stock pour la nouvelle variante
  customSizeInput = '';

  // Type d'unité sélectionné
  selectedUniteType: 'standard' | 'liquide' | 'poids' | 'conditionnement' | 'personnalise' =
    'standard';

  // ── Options du produit ──────────────────────────────────
  produitOptions: ProduitOptions = {
    avecCouleur: false,
    avecUnite: true,
    avecMarque: false,
    typeUnite: 'standard',
  };

  // ── Variantes (combinaisons couleur + taille + stock) ──────────────────────────────────
  variantes: ProduitVariante[] = [];
  useVariantesMode = false; // true = mode variantes activé
  stockExceeded = false; // true si le total des variantes dépasse le stock global

  // ── Images ───────────────────────────────────
  imagePreviews: string[] = [];

  constructor(
    private produitService: ProduitService,
    private categorieService: CategorieService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private router: Router,
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
      variantes: this.formBuilder.array([]),
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
        if (data && Array.isArray(data.arbre)) {
          this.categoriesTree = data.arbre;
        } else if (Array.isArray(data)) {
          this.categoriesTree = data;
        } else if (data && typeof data === 'object') {
          this.categoriesTree = data.arbre || data.data || data.categories || [];
        } else {
          this.categoriesTree = [];
        }
        this.refreshFlattenedCategories();
        this.filterCategories();
      },
      error: (error) => {
        console.error('❌ Error loading categories tree:', error);
        this.categoriesTree = [];
        this.refreshFlattenedCategories();
        this.filterCategories();
      },
    });
  }

  refreshFlattenedCategories() {
    this.flattenedCategories = this.flattenCategories(this.categoriesTree);
  }

  flattenCategories(tree: CategorieTree[], level: number = 0): FlatCategory[] {
    let result: FlatCategory[] = [];
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

  getFlattenedCategories(): FlatCategory[] {
    return this.flattenedCategories;
  }

  closeCategoryDropdown() {
    // No-op for now
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
      idCategorie: this.selectedCategories.join(','),
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

  getSelectionCountForRoot(root: CategorieTree): number {
    let count = 0;
    const idsToCheck = [root._id!];
    if (root.children) {
      root.children.forEach((child) => idsToCheck.push(child._id!));
    }
    for (const id of idsToCheck) {
      if (this.selectedCategories.includes(id)) {
        count++;
      }
    }
    return count;
  }

  setActiveRoot(rootId: string) {
    this.activeRootId = rootId;
  }

  filterCategories() {
    const query = this.categorySearchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredRoots = this.categoriesTree;
      return;
    }

    this.filteredRoots = this.categoriesTree.filter((root) => {
      if (root.nom.toLowerCase().includes(query)) return true;
      if (root.children && root.children.some((child) => child.nom.toLowerCase().includes(query)))
        return true;
      return false;
    });
  }

  getCategoryName(id: string): string {
    for (const item of this.flattenedCategories) {
      if (item.cat._id === id) {
        return item.cat.nom;
      }
    }
    return id;
  }

  loadCategories() {
    // Already loaded via loadCategoriesTree
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
        },
        error: () => {
          this.isCreatingCategorie = false;
          this.toastService.showError('Erreur lors de la création de la catégorie');
        },
      });
    }
  }

  // ── Stepper Navigation ───────────────────────
  goToStep(stepId: number) {
    if (stepId <= this.currentStep || stepId === this.currentStep + 1) {
      this.currentStep = stepId;
    }
  }

  nextStep() {
    if (this.currentStep < this.steps.length) {
      this.currentStep++;
    }
  }

  // ── Prix & Stock ─────────────────────────────
  adjustStock(delta: number) {
    const current = this.produitForm.get('stock.quantite')?.value || 0;
    const newValue = Math.max(0, current + delta);
    this.produitForm.get('stock.quantite')?.setValue(newValue);
    if (this.useVariantesMode) {
      this.checkStockExceeded();
    }
  }

  selectStatus(status: string) {
    this.selectedStatus = status;
    this.produitForm.patchValue({ statut: status });
  }

  // ── Couleurs ─────────────────────────────────
  isColorSelected(hex: string): boolean {
    return this.selectedColors.some((c) => c.hex === hex);
  }

  toggleColor(hex: string, name: string) {
    if (this.useVariantesMode) {
      // Mode variantes : sélection unique seulement
      if (this.singleSelectedColor?.hex === hex) {
        this.singleSelectedColor = null;
      } else {
        this.singleSelectedColor = { name, hex };
      }
      this.produitForm
        .get('attributs.couleur')
        ?.setValue(this.singleSelectedColor ? this.singleSelectedColor.name : '');
    } else {
      // Mode normal : multi-sélection
      const index = this.selectedColors.findIndex((c) => c.hex === hex);
      if (index > -1) {
        this.selectedColors.splice(index, 1);
      } else {
        this.selectedColors.push({ name, hex });
      }
      this.produitForm
        .get('attributs.couleur')
        ?.setValue(this.selectedColors.map((c) => c.name).join(', '));
      this.generateVariantes();
    }
  }

  selectColor(hex: string, name: string) {
    if (!this.isColorSelected(hex)) {
      this.selectedColors.push({ name, hex });
      this.produitForm
        .get('attributs.couleur')
        ?.setValue(this.selectedColors.map((c) => c.name).join(', '));
      this.generateVariantes();
    }
  }

  removeColor(hex: string) {
    const index = this.selectedColors.findIndex((c) => c.hex === hex);
    if (index > -1) {
      this.selectedColors.splice(index, 1);
      this.produitForm
        .get('attributs.couleur')
        ?.setValue(this.selectedColors.map((c) => c.name).join(', '));
      this.generateVariantes();
    }
  }

  updateColorFromText(value: string) {
    // Pour la saisie manuelle, on garde une couleur personnalisée
    if (value.startsWith('#')) {
      const customColor = { name: 'Personnalisée', hex: value };
      if (!this.selectedColors.some((c) => c.hex === value)) {
        this.selectedColors.push(customColor);
        this.produitForm
          .get('attributs.couleur')
          ?.setValue(this.selectedColors.map((c) => c.name).join(', '));
        this.generateVariantes();
      }
    }
  }

  updateColorFromPicker(value: string) {
    // Pour le picker, on ajoute la couleur si elle n'existe pas
    const colorName = this.colorPresets.find((c) => c.hex === value)?.name || 'Personnalisée';
    if (!this.selectedColors.some((c) => c.hex === value)) {
      this.selectedColors.push({ name: colorName, hex: value });
      this.produitForm
        .get('attributs.couleur')
        ?.setValue(this.selectedColors.map((c) => c.name).join(', '));
      this.generateVariantes();
    }
  }

  // Méthodes pour la sélection unique (mode variantes)
  isSingleColorSelected(hex: string): boolean {
    return this.singleSelectedColor?.hex === hex;
  }

  clearSingleColor() {
    this.singleSelectedColor = null;
    this.produitForm.get('attributs.couleur')?.setValue('');
  }

  // ── Tailles ──────────────────────────────────
  isSizeSelected(size: string): boolean {
    return this.selectedSizes.includes(size);
  }

  toggleSize(size: string) {
    if (this.useVariantesMode) {
      // Mode variantes : sélection unique seulement
      if (this.singleSelectedSize === size) {
        this.singleSelectedSize = '';
      } else {
        this.singleSelectedSize = size;
      }
      this.produitForm
        .get('attributs.taille')
        ?.setValue(this.singleSelectedSize ? [this.singleSelectedSize] : []);
    } else {
      // Mode normal : multi-sélection
      const index = this.selectedSizes.indexOf(size);
      if (index > -1) {
        this.selectedSizes.splice(index, 1);
      } else {
        this.selectedSizes.push(size);
      }
      this.updateTaillesForm();
    }
  }

  addCustomSize() {
    if (this.customSizeInput.trim()) {
      this.selectedSizes.push(this.customSizeInput.trim());
      this.customSizeInput = '';
      this.updateTaillesForm();
    }
  }

  removeSize(size: string) {
    const index = this.selectedSizes.indexOf(size);
    if (index > -1) {
      this.selectedSizes.splice(index, 1);
      this.updateTaillesForm();
    }
  }

  getCustomSizes(): string[] {
    return this.selectedSizes.filter((s) => !this.sizePresets.includes(s));
  }

  updateTaillesForm() {
    this.produitForm.get('attributs.taille')?.setValue(this.selectedSizes);
    this.generateVariantes();
  }

  // Méthodes pour la sélection unique (mode variantes)
  isSingleSizeSelected(size: string): boolean {
    return this.singleSelectedSize === size;
  }

  clearSingleSize() {
    this.singleSelectedSize = '';
    this.produitForm.get('attributs.taille')?.setValue([]);
  }

  updateSingleStock(delta: number) {
    this.singleSelectedStock = Math.max(0, this.singleSelectedStock + delta);
  }

  onStockInputChange(value: number) {
    this.singleSelectedStock = Math.max(0, value || 0);
  }

  // ── Variantes (combinaisons couleur + taille + stock) ──────────────────────────────────

  toggleVariantesMode() {
    this.useVariantesMode = !this.useVariantesMode;
    if (this.useVariantesMode) {
      this.generateVariantes();
    }
  }

  // ── Ajouter une variante manuellement ──────────────────────────────────

  addVarianteManually() {
    if (
      this.produitOptions.avecCouleur &&
      (!this.singleSelectedColor || !this.singleSelectedColor.hex)
    ) {
      this.toastService.showError('Veuillez sélectionner une couleur');
      return;
    }
    if (this.produitOptions.avecUnite && !this.singleSelectedSize.trim()) {
      this.toastService.showError('Veuillez sélectionner une unité');
      return;
    }

    // Vérifier si le stock des variantes dépasse le stock global
    if (this.stockExceeded) {
      this.toastService.showError(
        `Le total des variantes dépasse le stock global. Stock disponible : ${this.getAvailableStockForVariantes()} unités`,
      );
      return;
    }

    // Vérifier si la combinaison existe déjà
    const existingIndex = this.variantes.findIndex((v) => {
      const colorMatch =
        !this.produitOptions.avecCouleur || v.couleur === this.singleSelectedColor?.name;
      const uniteMatch =
        !this.produitOptions.avecUnite || v.unite === this.singleSelectedSize.trim();
      return colorMatch && uniteMatch;
    });

    if (existingIndex > -1) {
      this.toastService.showError('Cette combinaison existe déjà');
      return;
    }

    // Vérifier si le stock de cette variante dépasse le stock restant
    const availableStock = this.getAvailableStockForVariantes();
    if (this.singleSelectedStock > availableStock) {
      this.toastService.showError(
        `Stock insuffisant. Maximum ${availableStock} unités disponibles.`,
      );
      return;
    }

    // Ajouter la nouvelle variante
    this.variantes.push({
      couleur: this.produitOptions.avecCouleur ? this.singleSelectedColor?.name || '' : '',
      couleurHex: this.produitOptions.avecCouleur ? this.singleSelectedColor?.hex || '' : '',
      unite: this.produitOptions.avecUnite ? this.singleSelectedSize.trim() || '' : '',
      quantite: this.singleSelectedStock,
    });

    this.updateVariantesFormArray();
    this.checkStockExceeded();

    // Réinitialiser les sélections
    this.singleSelectedColor = null;
    this.singleSelectedSize = '';
    this.singleSelectedStock = 0;
    this.produitForm.get('attributs.couleur')?.setValue('');
    this.produitForm.get('attributs.taille')?.setValue([]);

    this.toastService.showSuccess('Variante ajoutée avec succès');
  }

  generateVariantes() {
    if (!this.useVariantesMode) return;

    // Si pas de couleurs/tailles sélectionnées, on vide les variantes
    if (
      this.produitOptions.avecCouleur &&
      this.selectedColors.length === 0 &&
      this.produitOptions.avecUnite &&
      this.selectedSizes.length === 0
    ) {
      this.variantes = [];
      this.updateVariantesFormArray();
      this.checkStockExceeded();
      return;
    }

    const newVariantes: ProduitVariante[] = [];

    // Générer toutes les combinaisons
    const couleurs =
      this.produitOptions.avecCouleur && this.selectedColors.length > 0
        ? this.selectedColors
        : [{ name: '', hex: '' }];
    const unites =
      this.produitOptions.avecUnite && this.selectedSizes.length > 0 ? this.selectedSizes : [''];

    for (const couleur of couleurs) {
      for (const unite of unites) {
        // Chercher si la variante existe déjà
        const existingVariante = this.variantes.find((v) => {
          const colorMatch = !this.produitOptions.avecCouleur || v.couleur === couleur.name;
          const uniteMatch = !this.produitOptions.avecUnite || v.unite === unite;
          return colorMatch && uniteMatch;
        });

        newVariantes.push({
          couleur: this.produitOptions.avecCouleur ? couleur.name : '',
          couleurHex: this.produitOptions.avecCouleur ? couleur.hex : '',
          unite: this.produitOptions.avecUnite ? unite : '',
          quantite: existingVariante ? existingVariante.quantite : 0,
        });
      }
    }

    this.variantes = newVariantes;
    this.updateVariantesFormArray();
    this.checkStockExceeded();
  }

  updateVariantesFormArray() {
    const formArray = this.produitForm.get('variantes') as any;
    formArray.clear();

    for (const variante of this.variantes) {
      formArray.push(
        this.formBuilder.group({
          couleur: [variante.couleur],
          couleurHex: [variante.couleurHex],
          unite: [variante.unite],
          quantite: [variante.quantite, [Validators.min(0)]],
        }),
      );
    }
  }

  updateVarianteQuantite(index: number, quantite: number) {
    if (index >= 0 && index < this.variantes.length) {
      const newQuantite = Math.max(0, quantite);
      this.variantes[index].quantite = newQuantite;
      const formArray = this.produitForm.get('variantes') as any;
      formArray.at(index)?.get('quantite')?.setValue(newQuantite);
      this.checkStockExceeded();
    }
  }

  decrementVarianteStock(index: number) {
    if (index >= 0 && index < this.variantes.length) {
      const newQuantite = Math.max(0, this.variantes[index].quantite - 1);
      this.updateVarianteQuantite(index, newQuantite);
    }
  }

  checkStockExceeded() {
    if (!this.useVariantesMode || this.variantes.length === 0) {
      this.stockExceeded = false;
      return;
    }
    const globalStock = this.produitForm.get('stock.quantite')?.value || 0;
    const totalVariantes = this.getTotalStock();
    this.stockExceeded = totalVariantes > globalStock;
  }

  getAvailableStockForVariantes(): number {
    const globalStock = this.produitForm.get('stock.quantite')?.value || 0;
    const currentTotal = this.getTotalStock();
    return globalStock - currentTotal;
  }

  removeVariante(index: number) {
    if (index >= 0 && index < this.variantes.length) {
      this.variantes.splice(index, 1);
      this.updateVariantesFormArray();
      this.checkStockExceeded();
    }
  }

  getTotalStock(): number {
    if (this.useVariantesMode && this.variantes.length > 0) {
      return this.variantes.reduce((total, v) => total + v.quantite, 0);
    }
    return this.produitForm.get('stock.quantite')?.value || 0;
  }

  // ── Images ───────────────────────────────────
  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach((file) => {
        if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
          this.toastService.showError(`Fichier invalide: ${file.name}`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          this.imagePreviews.push(base64);
          const images = this.produitForm.get('images')?.value || [];
          images.push(base64);
          this.produitForm.get('images')?.setValue(images);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  updateImageUrl(index: number, value: string) {
    const images = [...(this.produitForm.get('images')?.value || [])];
    images[index] = value;
    this.produitForm.get('images')?.setValue(images);
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

    if (index < this.imagePreviews.length) {
      this.imagePreviews.splice(index, 1);
    }
  }

  removePreview(index: number) {
    this.imagePreviews.splice(index, 1);
    const images = [...(this.produitForm.get('images')?.value || [])];
    images.splice(index, 1);
    this.produitForm.get('images')?.setValue(images);
  }

  // ── Description ──────────────────────────────
  onDescriptionInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.descriptionLength = target.value.length;
  }

  // ── Validation ───────────────────────────────
  isInvalid(field: string): boolean {
    const control = this.produitForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.produitForm.valid) {
      // Vérifier si le stock des variantes dépasse le stock global
      if (this.useVariantesMode && this.stockExceeded) {
        this.toastService.showError(
          `Le total des variantes (${this.getTotalStock()}) dépasse le stock global (${this.produitForm.get('stock.quantite')?.value}). Veuillez corriger.`,
        );
        return;
      }

      this.isSubmitting = true;
      const produitData = this.produitForm.value;

      // Si le mode variantes est activé, mettre à jour le stock global avec le total
      if (this.useVariantesMode && this.variantes.length > 0) {
        produitData.stock.quantite = this.getTotalStock();
        produitData.variantes = this.variantes;
      }

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
    } else {
      this.produitForm.markAllAsTouched();
      this.toastService.showError('Veuillez remplir tous les champs obligatoires');
    }
  }

  onCancel() {
    this.router.navigate(['/boutique/produits']);
  }
}
