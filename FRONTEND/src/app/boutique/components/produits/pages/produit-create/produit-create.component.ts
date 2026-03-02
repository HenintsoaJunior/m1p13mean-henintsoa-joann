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
import { TypeUniteService } from '../../services/type-unite.service';
import { CouleurService } from '../../services/couleur.service';
import { TailleService } from '../../services/taille.service';
import { TypeUnite, Couleur, Taille } from '../../models/boutique.models';

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
  unite: string;
  prix: number;  // Prix spécifique pour cette variante
  quantite: number;  // Stock spécifique pour cette variante
}

export interface ColorSelection {
  name: string;
  hex: string;
}

// Options pour personnaliser le formulaire selon le type de produit
export interface ProduitOptions {
  avecCouleur: boolean;
  avecUnite: boolean;
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
    { id: 2, label: 'Attributs', desc: 'Couleurs, Unités & Variantes' },
    { id: 3, label: 'Récapitulatif', desc: 'Vérification' },
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

  // ── Données API pour les attributs ─────────────────────────────────
  typesUnites: TypeUnite[] = [];
  couleurs: Couleur[] = [];
  tailles: Taille[] = [];
  selectedTypeUniteId: string | null = null;

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
  colorPresets: ColorPreset[] = [];

  selectedColors: ColorSelection[] = []; // Multi-sélection de couleurs
  singleSelectedColor: ColorSelection | null = null; // Sélection unique pour variantes

  // ── Unités (anciennement Tailles) ──────────────────────────────────
  // Unités standards (vêtements)
  sizePresets: string[] = [];
  // Unités liquides (bouteilles, flacons...)
  liquidPresets: string[] = [];
  // Unités poids (kg, g...)
  weightPresets: string[] = [];
  // Unités conditionnement (cartons, packs...)
  packagePresets: string[] = [];

  selectedSizes: string[] = [];
  singleSelectedSize: string = ''; // Sélection unique pour variantes
  customSizeInput = '';

  // ── Options du produit ──────────────────────────────────
  produitOptions: ProduitOptions = {
    avecCouleur: false,
    avecUnite: true,
  };

  // ── Variantes (combinaisons couleur + taille + stock) ──────────────────────────────────
  variantes: ProduitVariante[] = [];
  singleSelectedPrix: number = 0; // Prix pour la nouvelle variante
  singleSelectedStock: number = 0; // Stock pour la nouvelle variante
  useVariantesMode: boolean = true; // Mode variantes toujours activé
  stockExceeded: boolean = false; // Stock dépassé

  // ── Images ───────────────────────────────────
  imagePreviews: string[] = [];

  constructor(
    private produitService: ProduitService,
    private categorieService: CategorieService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private router: Router,
    private typeUniteService: TypeUniteService,
    private couleurService: CouleurService,
    private tailleService: TailleService,
  ) {
    this.produitForm = this.formBuilder.group({
      idCategorie: ['', [Validators.required]],
      nom: ['', [Validators.required]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
      description: [''],
      // Prix et stock sont maintenant dans les variantes, mais gardés pour initialisation
      prix: this.formBuilder.group({
        devise: ['Ar', [Validators.required]],
        montant: [0, [Validators.required, Validators.min(0)]],
      }),
      stock: this.formBuilder.group({
        quantite: [0, [Validators.required, Validators.min(0)]],
      }),
      variantes: this.formBuilder.array([]),
      images: [[]],
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
    this.loadTypesUnites();
    this.loadCouleurs();
  }

  loadTypesUnites() {
    this.typeUniteService.getAllTypesUnites(true).subscribe({
      next: (data) => {
        this.typesUnites = data.typesUnites;
        // Ne pas sélectionner de type par défaut, laisser l'utilisateur choisir
      },
      error: () => {
        this.toastService.showError('Erreur lors du chargement des types d\'unités');
      },
    });
  }

  loadCouleurs() {
    this.couleurService.getAllCouleurs(true).subscribe({
      next: (data) => {
        this.couleurs = data.couleurs;
        // Mettre à jour les presets de couleurs avec les données API
        this.colorPresets = this.couleurs.map(c => ({
          name: c.nom,
          hex: c.codeHex,
          display: c.codeHex,
        }));
      },
      error: () => {
        this.toastService.showError('Erreur lors du chargement des couleurs');
      },
    });
  }

  loadTaillesParType(idTypeUnite: string) {
    this.tailleService.getTaillesParTypeUnite(idTypeUnite).subscribe({
      next: (data) => {
        this.tailles = data.tailles;
        // Mettre à jour les presets en fonction du type d'unité
        this.updateSizePresets();
      },
      error: () => {
        this.toastService.showError('Erreur lors du chargement des tailles');
      },
    });
  }

  updateSizePresets() {
    // Mettre à jour les presets en fonction des tailles chargées
    const tailleValues = this.tailles.map(t => t.label || t.valeur);
    
    // Déterminer le type d'unité actuel
    const typeUnite = this.typesUnites.find(t => t._id === this.selectedTypeUniteId);
    
    if (typeUnite?.nom === 'standard') {
      this.sizePresets = tailleValues;
      this.liquidPresets = [];
      this.weightPresets = [];
      this.packagePresets = [];
    } else if (typeUnite?.nom === 'liquide') {
      this.liquidPresets = tailleValues;
      this.sizePresets = [];
      this.weightPresets = [];
      this.packagePresets = [];
    } else if (typeUnite?.nom === 'poids') {
      this.weightPresets = tailleValues;
      this.sizePresets = [];
      this.liquidPresets = [];
      this.packagePresets = [];
    } else if (typeUnite?.nom === 'conditionnement') {
      this.packagePresets = tailleValues;
      this.sizePresets = [];
      this.liquidPresets = [];
      this.weightPresets = [];
    }
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
      idCategorie: [...this.selectedCategories],
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
  }

  selectStatus(status: string) {
    this.selectedStatus = status;
    this.produitForm.patchValue({ statut: status });
  }

  // ── Type d'unité ─────────────────────────────────
  onTypeUniteChange(idTypeUnite: string) {
    this.selectedTypeUniteId = idTypeUnite;
    this.loadTaillesParType(idTypeUnite);
  }

  getTypeUniteLabel(): string {
    const typeUnite = this.typesUnites.find(t => t._id === this.selectedTypeUniteId);
    return typeUnite?.label || '—';
  }

  // ── Couleurs ─────────────────────────────────
  isColorSelected(hex: string): boolean {
    return this.selectedColors.some((c) => c.hex === hex);
  }

  toggleColor(hex: string, name: string) {
    // Mode normal : multi-sélection
    const index = this.selectedColors.findIndex((c) => c.hex === hex);
    if (index > -1) {
      this.selectedColors.splice(index, 1);
    } else {
      this.selectedColors.push({ name, hex });
    }
    // Auto-générer les variantes
    setTimeout(() => this.genererVariantes(), 100);
  }

  selectColor(hex: string, name: string) {
    if (!this.isColorSelected(hex)) {
      this.selectedColors.push({ name, hex });
      this.generateVariantes();
    }
  }

  removeColor(hex: string) {
    const index = this.selectedColors.findIndex((c) => c.hex === hex);
    if (index > -1) {
      this.selectedColors.splice(index, 1);
      this.generateVariantes();
    }
  }

  updateColorFromText(value: string) {
    // Pour la saisie manuelle, on sélectionne une couleur personnalisée
    if (value.startsWith('#')) {
      const customColor = { name: 'Personnalisée', hex: value };
      this.selectSingleColor(customColor.hex, customColor.name);
    }
  }

  updateColorFromPicker(value: string) {
    // Pour le picker, on sélectionne la couleur
    const colorName = this.colorPresets.find((c) => c.hex === value)?.name || 'Personnalisée';
    this.selectSingleColor(value, colorName);
  }

  // Toutes les couleurs disponibles (réutilisables dans plusieurs variantes)
  get colorPresetsAvailable(): ColorPreset[] {
    return this.colorPresets;
  }

  get taillesAvailable(): Taille[] {
    return this.tailles;
  }

  // Méthodes pour la sélection unique (mode variantes)
  isSingleColorSelected(hex: string): boolean {
    return this.singleSelectedColor?.hex === hex;
  }

  selectSingleColor(hex: string, name: string) {
    // Sélection unique : si on clique sur la même couleur, on désélectionne
    if (this.singleSelectedColor?.hex === hex) {
      this.clearSingleColor();
    } else {
      this.singleSelectedColor = { name, hex };
      // Réinitialiser le prix à la valeur du formulaire
      const prixBase = this.produitForm.get('prix.montant')?.value || 0;
      this.singleSelectedPrix = prixBase;
    }
  }

  clearSingleColor() {
    this.singleSelectedColor = null;
    this.singleSelectedPrix = 0;
  }

  // ── Tailles ──────────────────────────────────
  isSizeSelected(size: string): boolean {
    return this.selectedSizes.includes(size);
  }

  toggleSize(size: string) {
    // Mode normal : multi-sélection
    const index = this.selectedSizes.indexOf(size);
    if (index > -1) {
      this.selectedSizes.splice(index, 1);
    } else {
      this.selectedSizes.push(size);
    }
    this.updateTaillesForm();
    // Auto-générer les variantes
    setTimeout(() => this.genererVariantes(), 100);
  }

  addCustomSize() {
    if (this.customSizeInput.trim()) {
      this.selectedSizes.push(this.customSizeInput.trim());
      this.customSizeInput = '';
      this.updateTaillesForm();
      // Auto-générer les variantes
      setTimeout(() => this.genererVariantes(), 100);
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
    this.generateVariantes();
  }

  // Méthodes pour la sélection unique (mode variantes)
  isSingleSizeSelected(size: string): boolean {
    return this.singleSelectedSize === size;
  }

  selectSingleSize(size: string) {
    // Sélection unique : si on clique sur la même taille, on désélectionne
    if (this.singleSelectedSize === size) {
      this.clearSingleSize();
    } else {
      this.singleSelectedSize = size;
      // Réinitialiser le stock à 0
      this.singleSelectedStock = 0;
    }
  }

  addCustomSizeSingle() {
    if (this.customSizeInput.trim()) {
      this.selectSingleSize(this.customSizeInput.trim());
      this.customSizeInput = '';
    }
  }

  clearSingleSize() {
    this.singleSelectedSize = '';
    this.singleSelectedStock = 0;
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

    // Ajouter la nouvelle variante
    this.variantes.push({
      couleur: this.produitOptions.avecCouleur ? this.singleSelectedColor?.name || '' : '',
      couleurHex: this.produitOptions.avecCouleur ? this.singleSelectedColor?.hex || '' : '',
      unite: this.produitOptions.avecUnite ? this.singleSelectedSize.trim() || '' : '',
      prix: this.singleSelectedPrix > 0 ? this.singleSelectedPrix : (this.produitForm.get('prix.montant')?.value || 0),
      quantite: this.singleSelectedStock,
    });

    this.updateVariantesFormArray();

    // Réinitialiser les sélections
    this.singleSelectedColor = null;
    this.singleSelectedSize = '';
    this.singleSelectedPrix = 0;
    this.singleSelectedStock = 0;

    this.toastService.showSuccess('Variante ajoutée avec succès');
  }

  generateVariantes() {
    if (!this.useVariantesMode) return;

    const newVariantes: ProduitVariante[] = [];
    const prixBase = this.produitForm.get('prix.montant')?.value || 0;

    // Générer toutes les combinaisons
    const couleurs = this.produitOptions.avecCouleur && this.selectedColors.length > 0
      ? this.selectedColors
      : [{ name: '', hex: '' }];
    const unites = this.produitOptions.avecUnite && this.selectedSizes.length > 0
      ? this.selectedSizes
      : [''];

    for (const couleur of couleurs) {
      for (const unite of unites) {
        // Chercher si la variante existe déjà pour conserver le prix et le stock
        const existingVariante = this.variantes.find((v) => {
          const colorMatch = !this.produitOptions.avecCouleur || v.couleur === couleur.name;
          const uniteMatch = !this.produitOptions.avecUnite || v.unite === unite;
          return colorMatch && uniteMatch;
        });

        newVariantes.push({
          couleur: this.produitOptions.avecCouleur ? couleur.name : '',
          couleurHex: this.produitOptions.avecCouleur ? couleur.hex : '',
          unite: this.produitOptions.avecUnite ? unite : '',
          prix: existingVariante ? existingVariante.prix : prixBase,
          quantite: existingVariante ? existingVariante.quantite : 0,
        });
      }
    }

    this.variantes = newVariantes;
    this.updateVariantesFormArray();
  }

  // Génère automatiquement les variantes
  genererVariantes() {
    const newVariantes: ProduitVariante[] = [];
    const prixBase = this.produitForm.get('prix.montant')?.value || 0;

    // Générer toutes les combinaisons
    const couleurs = this.produitOptions.avecCouleur && this.selectedColors.length > 0
      ? this.selectedColors
      : [{ name: '', hex: '' }];
    const unites = this.produitOptions.avecUnite && this.selectedSizes.length > 0
      ? this.selectedSizes
      : [''];

    for (const couleur of couleurs) {
      for (const unite of unites) {
        // Chercher si la variante existe déjà pour conserver le prix et le stock
        const existingVariante = this.variantes.find((v) => {
          const colorMatch = !this.produitOptions.avecCouleur || v.couleur === couleur.name;
          const uniteMatch = !this.produitOptions.avecUnite || v.unite === unite;
          return colorMatch && uniteMatch;
        });

        newVariantes.push({
          couleur: this.produitOptions.avecCouleur ? couleur.name : '',
          couleurHex: this.produitOptions.avecCouleur ? couleur.hex : '',
          unite: this.produitOptions.avecUnite ? unite : '',
          prix: existingVariante ? existingVariante.prix : prixBase,
          quantite: existingVariante ? existingVariante.quantite : 0,
        });
      }
    }

    this.variantes = newVariantes;
    this.updateVariantesFormArray();
  }

  updateVariantePrix(index: number, prix: string) {
    if (index >= 0 && index < this.variantes.length) {
      const newPrix = parseFloat(prix) || 0;
      this.variantes[index].prix = Math.max(0, newPrix);
    }
  }

  updateVarianteStock(index: number, stock: string) {
    if (index >= 0 && index < this.variantes.length) {
      const newStock = parseInt(stock) || 0;
      this.variantes[index].quantite = Math.max(0, newStock);
    }
  }

  incrementVarianteStock(index: number) {
    if (index >= 0 && index < this.variantes.length) {
      this.variantes[index].quantite++;
    }
  }

  decrementVarianteStock(index: number) {
    if (index >= 0 && index < this.variantes.length) {
      this.variantes[index].quantite = Math.max(0, this.variantes[index].quantite - 1);
    }
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
          prix: [variante.prix, [Validators.min(0)]],
          quantite: [variante.quantite, [Validators.min(0)]],
        }),
      );
    }
  }

  removeVariante(index: number) {
    if (index >= 0 && index < this.variantes.length) {
      this.variantes.splice(index, 1);
      this.updateVariantesFormArray();
    }
  }

  getTotalStock(): number {
    if (this.variantes.length > 0) {
      return this.variantes.reduce((total, v) => total + (v.quantite || 0), 0);
    }
    return 0;
  }

  getAvailableStockForVariantes(): number {
    const globalStock = this.produitForm.get('stock.quantite')?.value || 0;
    const currentTotal = this.getTotalStock();
    return Math.max(0, globalStock - currentTotal);
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
      // Vérifier que les couleurs sont chargées
      if (this.produitOptions.avecCouleur && this.selectedColors.length > 0 && this.couleurs.length === 0) {
        this.toastService.showError('Chargement des couleurs en cours...');
        return;
      }

      // Vérifier que les tailles sont chargées
      if (this.produitOptions.avecUnite && this.selectedSizes.length > 0 && this.tailles.length === 0) {
        this.toastService.showError('Chargement des tailles en cours...');
        return;
      }

      this.isSubmitting = true;
      const produitData = this.produitForm.value;

      // S'assurer que idCategorie est toujours un tableau
      produitData.idCategorie = [...this.selectedCategories];

      // Formater les variantes avec prix et stock imbriqués
      if (this.useVariantesMode && this.variantes.length > 0) {
        produitData.variantes = this.variantes.map(v => ({
          couleur: v.couleur || '',
          couleurHex: v.couleurHex || '',
          unite: v.unite || '',
          typeUnitePrincipal: this.selectedTypeUniteId,
          prix: {
            devise: 'Ar',
            montant: v.prix || 0,
          },
          stock: {
            quantite: v.quantite || 0,
          },
        }));
      } else if (this.useVariantesMode && this.variantes.length === 0) {
        // Si pas de variantes, créer une variante par défaut
        produitData.variantes = [{
          couleur: '',
          couleurHex: '',
          unite: '',
          typeUnitePrincipal: this.selectedTypeUniteId,
          prix: {
            devise: 'Ar',
            montant: this.produitForm.get('prix.montant')?.value || 0,
          },
          stock: {
            quantite: this.produitForm.get('stock.quantite')?.value || 0,
          },
        }];
      }

      // Supprimer attributs, prix et stock globaux (maintenant dans les variantes)
      delete produitData.attributs;
      delete produitData.prix;
      delete produitData.stock;

      console.log('📤 Variantes à envoyer:', produitData.variantes);

      this.produitService.createProduit(produitData).subscribe({
        next: () => {
          this.toastService.showSuccess('Produit créé avec succès!');
          this.router.navigate(['/boutique/produits']);
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('❌ Erreur création produit:', err);
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
