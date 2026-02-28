import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ProduitService, Produit, ProduitFormData } from '../../services/produit.service';
import {
  CategorieService,
  CategorieTree,
  CategorieFormData,
} from '../../../categories/services/categorie.service';
import { ToastService } from '../../../../../services/toast.service';
import { TypeUniteService } from '../../services/type-unite.service';
import { CouleurService } from '../../services/couleur.service';
import { TailleService } from '../../services/taille.service';
import { MarqueService } from '../../services/marque.service';
import { TypeUnite, Couleur, Taille, Marque } from '../../models/boutique.models';
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
  prix: number;
  quantite: number;
}

export interface ColorSelection {
  name: string;
  hex: string;
}

export interface ProduitOptions {
  avecCouleur: boolean;
  avecUnite: boolean;
  avecMarque: boolean;
}

@Component({
  selector: 'app-produit-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './produit-edit.component.html',
  styleUrls: ['./produit-edit.component.scss'],
})
export class ProduitEditComponent implements OnInit {
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
  isLoading = true;
  produitId: string | null = null;

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

  selectedColors: ColorSelection[] = [];
  singleSelectedColor: ColorSelection | null = null;

  // ── Unités ──────────────────────────────────
  sizePresets: string[] = [];
  liquidPresets: string[] = [];
  weightPresets: string[] = [];
  packagePresets: string[] = [];

  selectedSizes: string[] = [];
  singleSelectedSize: string = '';
  customSizeInput = '';

  // ── Options du produit ──────────────────────────────────
  produitOptions: ProduitOptions = {
    avecCouleur: false,
    avecUnite: true,
    avecMarque: false,
  };

  // ── Variantes ──────────────────────────────────
  variantes: ProduitVariante[] = [];
  singleSelectedPrix: number = 0; // Prix pour la nouvelle variante
  singleSelectedStock: number = 0; // Stock pour la nouvelle variante
  useVariantesMode: boolean = true; // Mode variantes toujours activé
  stockExceeded: boolean = false; // Stock dépassé

  // ── Images ───────────────────────────────────
  imagePreviews: string[] = [];

  // ── Données API pour les attributs ─────────────────────────────────
  typesUnites: TypeUnite[] = [];
  couleurs: Couleur[] = [];
  tailles: Taille[] = [];
  marques: Marque[] = [];
  selectedTypeUniteId: string | null = null;
  selectedMarqueId: string | null = null;

  // ── Nouvelle marque ─────────────────────────────────
  showNewMarqueField = false;
  newMarqueNom = '';
  marqueSearchQuery = '';
  filteredMarques: Marque[] = [];

  constructor(
    private produitService: ProduitService,
    private categorieService: CategorieService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private typeUniteService: TypeUniteService,
    private couleurService: CouleurService,
    private tailleService: TailleService,
    private marqueService: MarqueService,
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
        couleurs: [[]],
        tailles: [[]],
        marque: [''],
        typeUnitePrincipal: [''],
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
    this.produitId = this.route.snapshot.paramMap.get('id');
    if (!this.produitId) {
      this.toastService.showError('ID du produit manquant');
      this.router.navigate(['/boutique/produits']);
      return;
    }

    // Charger d'abord les données de référence (couleurs, tailles, marques, types d'unités)
    this.loadTypesUnites();
    this.loadCouleurs();
    this.loadMarques();

    // Ensuite charger le produit
    this.loadProduit();
    this.loadCategories();
    this.loadCategoriesTree();
  }

  loadProduit() {
    if (!this.produitId) return;

    this.produitService.getProduitById(this.produitId).subscribe({
      next: (data: any) => {
        console.log('📡 Réponse API brute:', data);

        // Le backend peut retourner un objet { succes: true, donnees: produit } ou directement le produit
        let produit: Produit;
        if (data && typeof data === 'object') {
          if (data.succes && data.donnees) {
            produit = data.donnees;
          } else if (data.produit) {
            produit = data.produit;
          } else if (data.data) {
            produit = data.data;
          } else {
            produit = data;
          }
        } else {
          produit = data as Produit;
        }

        console.log('📦 Produit extrait:', produit);

        // Attendre que les couleurs et tailles soient chargées avant de peupler le formulaire
        setTimeout(() => {
          this.populateForm(produit);
        }, 500);

        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Erreur chargement produit:', err);
        this.toastService.showError('Erreur lors du chargement du produit');
        this.router.navigate(['/boutique/produits']);
        this.isLoading = false;
      },
    });
  }

  populateForm(produit: Produit) {
    console.log('📦 Produit chargé pour édition:', produit);

    // S'assurer que le formulaire est initialisé
    if (!this.produitForm) {
      console.error('❌ Formulaire non initialisé');
      return;
    }

    // Remplir le formulaire avec les données du produit
    const patchValue: any = {
      nom: produit.nom || '',
      slug: produit.slug || '',
      description: produit.description || '',
      statut: produit.statut || 'actif',
    };

    // Gérer les catégories
    if (Array.isArray(produit.idCategorie)) {
      const catIds = produit.idCategorie.map((c: any) => (typeof c === 'object' ? c._id : c));
      patchValue.idCategorie = catIds.join(',');
      this.selectedCategories = catIds;
    } else if (typeof produit.idCategorie === 'string') {
      patchValue.idCategorie = produit.idCategorie;
      this.selectedCategories = produit.idCategorie.split(',').filter(Boolean);
    } else if (produit.idCategorie && typeof produit.idCategorie === 'object') {
      patchValue.idCategorie = produit.idCategorie._id;
      this.selectedCategories = [produit.idCategorie._id];
    }

    // Gérer le prix
    if (produit.prix) {
      patchValue.prix = {
        devise: produit.prix.devise || 'EUR',
        montant: produit.prix.montant || 0,
      };
    }

    // Gérer le stock
    if (produit.stock) {
      patchValue.stock = {
        quantite: produit.stock.quantite || 0,
      };
    }

    // Gérer les attributs
    patchValue.attributs = {
      couleurs: Array.isArray(produit.attributs?.couleurs) ? produit.attributs.couleurs : [],
      tailles: Array.isArray(produit.attributs?.tailles) ? produit.attributs.tailles : [],
      marque: produit.attributs?.marque || '',
      typeUnitePrincipal: produit.attributs?.typeUnitePrincipal || '',
    };

    console.log('📝 Valeurs à patcher:', patchValue);
    this.produitForm.patchValue(patchValue, { emitEvent: false });

    console.log('✅ Formulaire patché, valeur actuelle:', {
      nom: this.produitForm.get('nom')?.value,
      slug: this.produitForm.get('slug')?.value,
      prix: this.produitForm.get('prix')?.value,
      stock: this.produitForm.get('stock')?.value,
    });

    // Sélectionner le statut
    this.selectedStatus = produit.statut || 'actif';

    // Charger les images
    if (produit.images && produit.images.length > 0) {
      this.imagePreviews = [...produit.images];
      this.produitForm.get('images')?.setValue([...produit.images], { emitEvent: false });
    }

    // Charger les variantes
    if (produit.variantes && produit.variantes.length > 0) {
      this.variantes = produit.variantes.map((v) => ({
        couleur: v.couleur || '',
        couleurHex: v.couleurHex || '',
        unite: v.unite || '',
        prix: (typeof v.prix === 'number' ? v.prix : v.prix?.montant) || 0,
        quantite: (v as any).stock?.quantite || (v as any).quantite || 0,
      }));
      this.useVariantesMode = true;
      this.updateVariantesFormArray();
      console.log('📦 Variantes chargées:', this.variantes);
    }

    // Mettre à jour les options
    this.produitOptions.avecCouleur = !!(
      produit.attributs?.couleurs && produit.attributs.couleurs.length > 0
    );
    this.produitOptions.avecUnite = !!(
      produit.attributs?.tailles && produit.attributs.tailles.length > 0
    );
    this.produitOptions.avecMarque = !!produit.attributs?.marque;

    // Initialiser les couleurs sélectionnées depuis la BDD
    if (produit.attributs?.couleurs && Array.isArray(produit.attributs.couleurs)) {
      console.log('🎨 Couleurs à initialiser:', produit.attributs.couleurs);
      console.log('🎨 Couleurs disponibles en mémoire:', this.couleurs);

      produit.attributs.couleurs.forEach((couleurId: string) => {
        const couleurDb = this.couleurs.find((c) => c._id === couleurId);
        console.log('🔍 Recherche couleur ID:', couleurId, '→ Trouvée:', couleurDb);
        if (couleurDb) {
          this.selectedColors.push({ name: couleurDb.nom, hex: couleurDb.codeHex });
        }
      });

      console.log('✅ Couleurs sélectionnées:', this.selectedColors);
    }

    // Initialiser les tailles sélectionnées depuis la BDD
    if (produit.attributs?.tailles && Array.isArray(produit.attributs.tailles)) {
      console.log('📏 Tailles à initialiser:', produit.attributs.tailles);
      console.log('📏 Tailles disponibles en mémoire:', this.tailles);

      produit.attributs.tailles.forEach((tailleId: string) => {
        const tailleDb = this.tailles.find((t) => t._id === tailleId);
        console.log('🔍 Recherche taille ID:', tailleId, '→ Trouvée:', tailleDb);
        if (tailleDb) {
          this.selectedSizes.push(tailleDb.label || tailleDb.valeur);
        }
      });

      console.log('✅ Tailles sélectionnées:', this.selectedSizes);
    }

    // Initialiser la marque sélectionnée depuis la BDD
    if (produit.attributs?.marque) {
      const marqueId =
        typeof produit.attributs.marque === 'string'
          ? produit.attributs.marque
          : produit.attributs.marque._id;
      const marqueDb = this.marques.find((m) => m._id === marqueId);
      if (marqueDb) {
        this.selectedMarqueId = marqueId;
      }
    }

    // Initialiser le type d'unité principal
    if (produit.attributs?.typeUnitePrincipal) {
      const typeUniteId =
        typeof produit.attributs.typeUnitePrincipal === 'string'
          ? produit.attributs.typeUnitePrincipal
          : produit.attributs.typeUnitePrincipal._id;
      this.selectedTypeUniteId = typeUniteId;
      this.loadTaillesParType(typeUniteId);
    }

    // Mettre à jour la longueur de description
    this.descriptionLength = (produit.description || '').length;

    console.log('🎨 Options:', this.produitOptions);
    console.log('📂 Catégories sélectionnées:', this.selectedCategories);
    console.log('📝 Description length:', this.descriptionLength);

    // Forcer la détection de changement
    setTimeout(() => {
      console.log('🔄 Après setTimeout - Formulaire:', {
        nom: this.produitForm.get('nom')?.value,
        slug: this.produitForm.get('slug')?.value,
        idCategorie: this.produitForm.get('idCategorie')?.value,
      });
    }, 100);
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

  loadTypesUnites() {
    this.typeUniteService.getAllTypesUnites(true).subscribe({
      next: (data) => {
        this.typesUnites = data.typesUnites;
        // Ne pas sélectionner de type par défaut, laisser l'utilisateur choisir
      },
      error: () => {
        this.toastService.showError("Erreur lors du chargement des types d'unités");
      },
    });
  }

  loadCouleurs() {
    this.couleurService.getAllCouleurs(true).subscribe({
      next: (data) => {
        this.couleurs = data.couleurs;
        // Mettre à jour les presets de couleurs avec les données API
        this.colorPresets = this.couleurs.map((c) => ({
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
    const tailleValues = this.tailles.map((t) => t.label || t.valeur);

    // Déterminer le type d'unité actuel
    const typeUnite = this.typesUnites.find((t) => t._id === this.selectedTypeUniteId);

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

  loadMarques() {
    this.marqueService.getAllMarques(true).subscribe({
      next: (data) => {
        this.marques = data.marques;
        this.filteredMarques = this.marques; // Initialiser les marques filtrées
      },
      error: () => {
        this.toastService.showError('Erreur lors du chargement des marques');
      },
    });
  }

  filterMarques() {
    const query = this.marqueSearchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredMarques = this.marques;
    } else {
      this.filteredMarques = this.marques.filter(m =>
        m.nom.toLowerCase().includes(query)
      );
    }
  }

  selectMarque(marqueId: string) {
    this.selectedMarqueId = marqueId;
    this.onMarqueChange();
  }

  getSelectedMarqueName(): string {
    const marque = this.marques.find(m => m._id === this.selectedMarqueId);
    return marque ? marque.nom : 'Inconnue';
  }

  clearMarque() {
    this.selectedMarqueId = null;
    this.onMarqueChange();
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

  toggleVariantesMode() {
    this.useVariantesMode = !this.useVariantesMode;
    if (this.useVariantesMode) {
      this.generateVariantes();
    }
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

  // ── Type d'unité ─────────────────────────────────
  onTypeUniteChange(idTypeUnite: string) {
    this.selectedTypeUniteId = idTypeUnite;
    this.loadTaillesParType(idTypeUnite);
  }

  // ── Marque ─────────────────────────────────
  onMarqueChange() {
    this.produitForm.get('attributs.marque')?.setValue(this.selectedMarqueId);
  }

  createNewMarque() {
    if (!this.newMarqueNom.trim()) {
      this.toastService.showError('Veuillez entrer un nom de marque');
      return;
    }

    const slug = this.newMarqueNom
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    this.marqueService.createMarque({ nom: this.newMarqueNom.trim(), slug }).subscribe({
      next: (data) => {
        this.selectedMarqueId = data.marque._id!;
        this.produitForm.get('attributs.marque')?.setValue(this.selectedMarqueId);
        this.loadMarques();
        this.newMarqueNom = '';
        this.showNewMarqueField = false;
        this.toastService.showSuccess('Marque créée avec succès');
      },
      error: () => {
        this.toastService.showError('Erreur lors de la création de la marque');
      },
    });
  }

  // ── Couleurs ─────────────────────────────────
  isColorSelected(hex: string): boolean {
    return this.selectedColors.some((c) => c.hex === hex);
  }

  toggleColor(hex: string, name: string) {
    if (this.useVariantesMode) {
      if (this.singleSelectedColor?.hex === hex) {
        this.singleSelectedColor = null;
      } else {
        this.singleSelectedColor = { name, hex };
      }
      this.produitForm
        .get('attributs.couleurs')
        ?.setValue(this.singleSelectedColor ? this.singleSelectedColor.name : '');
    } else {
      const index = this.selectedColors.findIndex((c) => c.hex === hex);
      if (index > -1) {
        this.selectedColors.splice(index, 1);
      } else {
        this.selectedColors.push({ name, hex });
      }
      this.produitForm
        .get('attributs.couleurs')
        ?.setValue(this.selectedColors.map((c) => c.name).join(', '));
    }
  }

  removeColor(hex: string) {
    const index = this.selectedColors.findIndex((c) => c.hex === hex);
    if (index > -1) {
      this.selectedColors.splice(index, 1);
      this.produitForm
        .get('attributs.couleurs')
        ?.setValue(this.selectedColors.map((c) => c.name).join(', '));
    }
  }

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
    this.produitForm.get('attributs.couleurs')?.setValue('');
  }

  // ── Tailles ──────────────────────────────────
  isSizeSelected(size: string): boolean {
    return this.selectedSizes.includes(size);
  }

  toggleSize(size: string) {
    if (this.useVariantesMode) {
      if (this.singleSelectedSize === size) {
        this.singleSelectedSize = '';
      } else {
        this.singleSelectedSize = size;
      }
      this.produitForm
        .get('attributs.tailles')
        ?.setValue(this.singleSelectedSize ? [this.singleSelectedSize] : []);
    } else {
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
      // Auto-générer les variantes
      setTimeout(() => this.generateVariantes(), 100);
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

  getSelectedColorsNames(): string {
    return this.selectedColors.map((c) => c.name).join(', ');
  }

  updateTaillesForm() {
    this.produitForm.get('attributs.tailles')?.setValue(this.selectedSizes);
  }

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
    this.produitForm.get('attributs.tailles')?.setValue([]);
  }

  updateSingleStock(delta: number) {
    this.singleSelectedStock = Math.max(0, this.singleSelectedStock + delta);
  }

  onStockInputChange(value: number) {
    this.singleSelectedStock = Math.max(0, value || 0);
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

    this.variantes.push({
      couleur: this.produitOptions.avecCouleur ? this.singleSelectedColor?.name || '' : '',
      couleurHex: this.produitOptions.avecCouleur ? this.singleSelectedColor?.hex || '' : '',
      unite: this.produitOptions.avecUnite ? this.singleSelectedSize.trim() || '' : '',
      prix: this.singleSelectedPrix > 0 ? this.singleSelectedPrix : (this.produitForm.get('prix.montant')?.value || 0),
      quantite: this.singleSelectedStock,
    });

    this.updateVariantesFormArray();
    this.checkStockExceeded();

    this.singleSelectedColor = null;
    this.singleSelectedSize = '';
    this.singleSelectedPrix = 0;
    this.singleSelectedStock = 0;
    this.produitForm.get('attributs.couleurs')?.setValue('');
    this.produitForm.get('attributs.tailles')?.setValue([]);

    this.toastService.showSuccess('Variante ajoutée avec succès');
  }

  generateVariantes() {
    if (!this.useVariantesMode) return;

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

    const couleurs =
      this.produitOptions.avecCouleur && this.selectedColors.length > 0
        ? this.selectedColors
        : [{ name: '', hex: '' }];
    const unites =
      this.produitOptions.avecUnite && this.selectedSizes.length > 0 ? this.selectedSizes : [''];

    for (const couleur of couleurs) {
      for (const unite of unites) {
        const existingVariante = this.variantes.find((v) => {
          const colorMatch = !this.produitOptions.avecCouleur || v.couleur === couleur.name;
          const uniteMatch = !this.produitOptions.avecUnite || v.unite === unite;
          return colorMatch && uniteMatch;
        });

        newVariantes.push({
          couleur: this.produitOptions.avecCouleur ? couleur.name : '',
          couleurHex: this.produitOptions.avecCouleur ? couleur.hex : '',
          unite: this.produitOptions.avecUnite ? unite : '',
          prix: existingVariante ? existingVariante.prix : (this.produitForm.get('prix.montant')?.value || 0),
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
          prix: [variante.prix, [Validators.min(0)]],
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

  removeVariante(index: number) {
    if (index >= 0 && index < this.variantes.length) {
      this.variantes.splice(index, 1);
      this.updateVariantesFormArray();
      this.checkStockExceeded();
    }
  }

  getTotalStock(): number {
    if (this.useVariantesMode && this.variantes.length > 0) {
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
    if (!this.produitId) return;

    if (this.produitForm.valid) {
      if (this.useVariantesMode && this.stockExceeded) {
        this.toastService.showError(
          `Le total des variantes (${this.getTotalStock()}) dépasse le stock global (${this.produitForm.get('stock.quantite')?.value}). Veuillez corriger.`,
        );
        return;
      }

      // Vérifier que les couleurs sont chargées
      if (
        this.produitOptions.avecCouleur &&
        this.selectedColors.length > 0 &&
        this.couleurs.length === 0
      ) {
        this.toastService.showError('Chargement des couleurs en cours...');
        return;
      }

      // Vérifier que les tailles sont chargées
      if (
        this.produitOptions.avecUnite &&
        this.selectedSizes.length > 0 &&
        this.tailles.length === 0
      ) {
        this.toastService.showError('Chargement des tailles en cours...');
        return;
      }

      this.isSubmitting = true;

      // Formater les variantes avec prix et stock imbriqués
      const variantesFormatees = this.variantes.map(v => ({
        couleur: v.couleur || '',
        couleurHex: v.couleurHex || '',
        unite: v.unite || '',
        typeUnitePrincipal: this.selectedTypeUniteId,
        prix: {
          devise: 'EUR',
          montant: v.prix || 0,
        },
        stock: {
          quantite: v.quantite || 0,
        },
      }));

      const produitData: any = this.produitForm.value;

      if (this.useVariantesMode && this.variantes.length > 0) {
        produitData.variantes = variantesFormatees;
      }

      // Supprimer attributs, prix et stock globaux (maintenant dans les variantes)
      delete produitData.attributs;
      delete produitData.prix;
      delete produitData.stock;

      console.log('📤 Variantes à envoyer:', produitData.variantes);

      this.produitService.updateProduit(this.produitId, produitData).subscribe({
        next: () => {
          this.router.navigate(['/boutique/produits']);
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('❌ Erreur mise à jour produit:', err);
          this.isSubmitting = false;
          this.toastService.showError('Erreur lors de la mise à jour du produit');
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
