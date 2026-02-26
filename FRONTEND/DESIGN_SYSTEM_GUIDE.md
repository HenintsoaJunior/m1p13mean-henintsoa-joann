# 📘 GUIDE DU DESIGN SYSTEM - ADMIN CENTRES

Ce guide explique comment utiliser le design system à partir des composants dans `app/admin/components/centres/pages`.

---

## 📋 TABLE DES MATIÈRES

1. [Architecture du Design System](#1-architecture-du-design-system)
2. [Variables CSS et Couleurs](#2-variables-css-et-couleurs)
3. [Tableau de Données (data-table)](#3-tableau-de-données-data-table)
4. [Filtres et Recherche](#4-filtres-et-recherche)
5. [Pagination](#5-pagination)
6. [Modales / Popups](#6-modales--popups)
7. [Formulaires](#7-formulaires)
8. [Boutons](#8-boutons)
9. [Badges et Statuts](#9-badges-et-statuts)
10. [Responsive Design](#10-responsive-design)
11. [Exemple Complet](#11-exemple-complet)

---

## 1. ARCHITECTURE DU DESIGN SYSTEM

### 📁 Fichiers de référence

```
FRONTEND/src/
├── styles/
│   ├── variables.css      ← Toutes les variables CSS (couleurs, spacing, typo)
│   └── components.css     ← Composants réutilisables globaux
├── app/admin/components/centres/pages/
│   ├── centres-list/      ← Page liste avec cards
│   ├── centre-crud/       ← Page CRUD complète (tableau, filtres, modal, form)
│   ├── batiments-crud/
│   ├── etages-crud/
│   └── emplacements-crud/
```

### 🏗️ Structure d'une page CRUD

```
page-container
├── filters-section
│   └── filters-container
│       ├── filters-header
│       └── filters-content
└── table-container
    ├── table-header
    ├── data-table
    ├── pagination-container
    └── modal-overlay (popup)
        └── modal-content
            ├── modal-header
            ├── modal-body
            │   └── form
            └── modal-actions
```

---

## 2. VARIABLES CSS ET COULEURS

### 📍 Fichier : `src/styles/variables.css`

### Couleurs principales

```css
/* Couleurs du sidebar */
--sidebar-primary: #3660a9;   /* Bleu principal */
--sidebar-accent: #fab548;    /* Doré accent */

/* Couleurs sémantiques */
--color-success-dark: #065f46;   /* Vert foncé */
--color-danger-dark: #991b1b;    /* Rouge foncé */
--color-focus: #3b82f6;          /* Bleu focus */
```

### Utilisation dans les composants

```html
<!-- Bouton primaire -->
<button class="btn btn-primary">Créer</button>
<!-- Utilise --sidebar-primary comme background -->

<!-- Bouton succès -->
<button class="btn btn-success">Valider</button>
<!-- Utilise --color-success-dark -->

<!-- Bouton danger -->
<button class="btn btn-danger">Supprimer</button>
<!-- Utilise --color-danger-dark -->
```

### Espacement

```css
--space-1: 4px    --space-4: 16px   --space-8: 32px
--space-2: 8px    --space-5: 20px   --space-10: 40px
--space-3: 12px   --space-6: 24px   --space-12: 48px
```

---

## 3. TABLEAU DE DONNÉES (DATA-TABLE)

### 📍 Fichier de référence : `centre-crud.component.html`

### Structure HTML

```html
<div class="table-container">
  <div class="table-header">
    <h3 class="table-title">Liste des Centres</h3>
    <button class="btn btn-primary">
      <i class="fas fa-plus"></i> Nouveau
    </button>
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th>Nom</th>
        <th>Ville</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr class="table-row" *ngFor="let item of items">
        <td>
          <div class="centre-info">
            <div class="centre-name">{{ item.nom }}</div>
            <div class="centre-slug">{{ item.slug }}</div>
          </div>
        </td>
        <td>{{ item.ville }}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon btn-delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>

  <!-- État vide -->
  <div *ngIf="items.length === 0" class="empty-state">
    <i class="fas fa-store"></i>
    <h3>Aucun élément trouvé</h3>
    <p>Commencez par créer votre premier élément</p>
  </div>
</div>
```

### Classes CSS utilisées

| Classe | Description |
|--------|-------------|
| `.table-container` | Conteneur principal avec bordure et ombre |
| `.table-header` | En-tête avec titre et bouton d'action |
| `.table-title` | Titre du tableau (18px, bold) |
| `.data-table` | Tableau de données stylisé |
| `.table-row` | Ligne avec hover effect |
| `.empty-state` | État vide avec icône et message |
| `.action-buttons` | Container pour boutons d'action |
| `.btn-icon` | Bouton icône carré (32x32px) |
| `.btn-edit` | Bouton édition (bleu) |
| `.btn-delete` | Bouton suppression (rouge) |

### SCSS personnalisé (dans le component)

```scss
.centre-info .centre-name {
  font-weight: 500;
  color: var(--text-primary);
}

.centre-info .centre-slug {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 2px;
}
```

---

## 4. FILTRES ET RECHERCHE

### 📍 Fichier de référence : `centre-crud.component.html`

### Structure HTML

```html
<div class="filters-section">
  <div class="filters-container">
    <div class="filters-header">
      <i class="fa-solid fa-filter"></i>
      <span>Filtres</span>
    </div>
    <div class="filters-content">
      <!-- Barre de recherche -->
      <div class="search-box">
        <input
          type="text"
          placeholder="Rechercher..."
          [(ngModel)]="searchTerm"
          (input)="filterItems()"
        />
      </div>

      <!-- Select filtre -->
      <select [(ngModel)]="filterStatut" (change)="filterByStatut()" class="form-control">
        <option value="">Tous les statuts</option>
        <option value="actif">Actif</option>
        <option value="archive">Archivé</option>
      </select>

      <!-- Bouton reset -->
      <button class="btn btn-danger" (click)="resetFilters()">
        Effacer
      </button>
    </div>
  </div>
</div>
```

### Classes CSS utilisées

| Classe | Description |
|--------|-------------|
| `.filters-section` | Section principale des filtres |
| `.filters-container` | Conteneur avec bordure supérieure colorée |
| `.filters-header` | Header avec icône filtre |
| `.filters-content` | Grid responsive pour les inputs |
| `.search-box` | Container input de recherche |

### Responsive Grid

```css
/* Dans components.css */
.filters-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}
```

---

## 5. PAGINATION

### 📍 Fichier de référence : `centre-crud.component.html`

### Structure HTML

```html
<div class="pagination-container" *ngIf="totalPages >= 1">
  <div class="pagination-info">
    <span>Affichage page {{ currentPage }} sur {{ totalPages }}</span>
    <select [(ngModel)]="pageSize" (ngModelChange)="onPageSizeChange()">
      <option *ngFor="let size of pageSizeOptions" [value]="size">
        {{ size }} par page
      </option>
    </select>
  </div>

  <div class="pagination-controls" *ngIf="totalPages > 1">
    <!-- Première page -->
    <button (click)="goToPage(1)" [disabled]="currentPage === 1">
      <i class="fas fa-angle-double-left"></i>
    </button>

    <!-- Page précédente -->
    <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">
      <i class="fas fa-angle-left"></i>
    </button>

    <!-- Pages numérotées -->
    <button *ngFor="let p of pages" [class.active]="p === currentPage" (click)="goToPage(p)">
      {{ p }}
    </button>

    <!-- Page suivante -->
    <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">
      <i class="fas fa-angle-right"></i>
    </button>

    <!-- Dernière page -->
    <button (click)="goToPage(totalPages)" [disabled]="currentPage === totalPages">
      <i class="fas fa-angle-double-right"></i>
    </button>
  </div>
</div>
```

### Component TypeScript

```typescript
// Pagination
currentPage: number = 1;
pageSize: number = 10;
totalItems: number = 0;
totalPages: number = 0;
pageSizeOptions: number[] = [5, 10, 25, 50];

goToPage(page: number): void {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
    this.loadItems();
  }
}

onPageSizeChange(): void {
  this.currentPage = 1;
  this.loadItems();
}

get pages(): number[] {
  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(this.totalPages, start + maxVisible - 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
}
```

### Classes CSS utilisées

| Classe | Description |
|--------|-------------|
| `.pagination-container` | Container gris clair avec bordure |
| `.pagination-info` | Info texte + select taille page |
| `.pagination-controls` | Boutons de navigation |
| `.pagination-btn` | Bouton de page (36x36px) |
| `.pagination-btn.active` | Page active (fond bleu) |
| `.pagination-btn:disabled` | Bouton désactivé (opacité 40%) |

---

## 6. MODALES / POPUPS

### 📍 Fichier de référence : `centre-crud.component.html`

### Structure HTML

```html
<!-- Overlay -->
<div *ngIf="showModal" class="modal-overlay" (click)="closeModal()">
  
  <!-- Contenu modal -->
  <div class="modal-content" (click)="$event.stopPropagation()">
    
    <!-- Header -->
    <div class="modal-header">
      <h2 class="modal-title">{{ editingItem ? 'Modifier' : 'Nouveau' }}</h2>
      <button class="btn-close" (click)="closeModal()">×</button>
    </div>

    <!-- Body avec formulaire -->
    <div class="modal-body">
      <form [formGroup]="itemForm" (ngSubmit)="onSubmit()" class="form">
        <!-- Champs du formulaire -->
      </form>
    </div>

    <!-- Footer avec actions -->
    <div class="modal-actions">
      <button type="button" class="btn btn-secondary" (click)="closeModal()">
        Annuler
      </button>
      <button type="submit" [disabled]="form.invalid" class="btn btn-primary">
        {{ isSubmitting ? 'En cours...' : 'Enregistrer' }}
      </button>
    </div>
  </div>
</div>
```

### Component TypeScript

```typescript
showModal = false;
editingItem: Item | null = null;
isSubmitting = false;

openCreateModal() {
  this.editingItem = null;
  this.form.reset();
  this.showModal = true;
}

editItem(item: Item) {
  this.editingItem = item;
  this.form.patchValue(item);
  this.showModal = true;
}

closeModal() {
  this.showModal = false;
  this.editingItem = null;
  this.form.reset();
}

onSubmit() {
  if (this.form.valid) {
    this.isSubmitting = true;
    // API call...
  }
}
```

### Classes CSS utilisées

| Classe | Description |
|--------|-------------|
| `.modal-overlay` | Fond sombre semi-transparent (backdrop) |
| `.modal-content` | Container blanc (max-width: 600px) |
| `.modal-header` | Header avec titre et bouton fermer |
| `.modal-title` | Titre (20px, bold) |
| `.btn-close` | Bouton × (32x32px) |
| `.modal-body` | Corps avec padding 24px |
| `.modal-actions` | Footer avec boutons d'action |

---

## 7. FORMULAIRES

### 📍 Fichier de référence : `centre-crud.component.html`

### Structure HTML

```html
<form [formGroup]="centreForm" (ngSubmit)="onSubmit()" class="form">
  
  <!-- Grid de champs -->
  <div class="form-grid">
    
    <!-- Champ texte avec label -->
    <div class="form-group">
      <label for="nom">
        Nom du centre <span class="required">*</span>
      </label>
      <input
        type="text"
        id="nom"
        formControlName="nom"
        class="form-control"
        placeholder="Ex: Akoor Antananarivo"
      />
      <small class="form-hint">Généré automatiquement</small>
      <div *ngIf="form.get('nom')?.errors" class="error-message">
        Le nom est requis
      </div>
    </div>

    <!-- Select -->
    <div class="form-group">
      <label for="ville">Ville</label>
      <select id="ville" formControlName="ville" class="form-control">
        <option value="">Sélectionner</option>
        <option value="Antananarivo">Antananarivo</option>
      </select>
    </div>

    <!-- Champ pleine largeur -->
    <div class="form-group full-width">
      <label for="description">Description</label>
      <textarea
        id="description"
        formControlName="description"
        rows="3"
        class="form-control"
      ></textarea>
    </div>
  </div>

  <!-- Section avec titre -->
  <div class="form-section">
    <h3 class="form-section-title">Adresse</h3>
    <div class="form-grid" formGroupName="adresse">
      <div class="form-group">
        <label for="rue">Rue</label>
        <input type="text" id="rue" formControlName="rue" class="form-control" />
      </div>
      <div class="form-group">
        <label for="ville">Ville</label>
        <input type="text" id="ville" formControlName="ville" class="form-control" />
      </div>
    </div>
  </div>

  <!-- Upload de fichier -->
  <div class="form-group">
    <label>Image du centre</label>
    <div class="file-upload-container">
      <div class="file-input-wrapper">
        <label for="imageFile" class="file-input-label">
          <i class="fas fa-upload"></i>
          Choisir une image
        </label>
        <input type="file" id="imageFile" accept="image/*" (change)="onFileSelected($event)" />
      </div>
      <div class="image-preview" *ngIf="imagePreview">
        <img [src]="imagePreview" alt="Aperçu" />
      </div>
    </div>
  </div>

  <!-- Actions -->
  <div class="modal-actions">
    <button type="button" class="btn btn-secondary">Annuler</button>
    <button type="submit" [disabled]="form.invalid" class="btn btn-primary">
      <i *ngIf="isSubmitting" class="fas fa-spinner fa-spin"></i>
      {{ isSubmitting ? 'En cours...' : 'Enregistrer' }}
    </button>
  </div>
</form>
```

### Component TypeScript

```typescript
centreForm: FormGroup;

constructor(private formBuilder: FormBuilder) {
  this.centreForm = this.formBuilder.group({
    nom: ['', [Validators.required]],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    description: [''],
    email_contact: ['', [Validators.email]],
    adresse: this.formBuilder.group({
      rue: [''],
      ville: [''],
      code_postal: [''],
      pays: ['Madagascar'],
    }),
  });
}

// Générer le slug automatiquement
generateSlug() {
  const nom = this.form.get('nom')?.value;
  if (nom) {
    const slug = nom
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    this.form.patchValue({ slug });
  }
}

// Upload d'image avec compression
onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    
    // Vérifier type et taille
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
      this.toastService.showError('Image invalide');
      return;
    }

    // Compression avec canvas
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Redimensionner et compresser...
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        this.imagePreview = compressedBase64;
        this.form.patchValue({ image_url: compressedBase64 });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}
```

### Classes CSS utilisées

| Classe | Description |
|--------|-------------|
| `.form` | Formulaire de base |
| `.form-section` | Section de formulaire |
| `.form-section-title` | Titre de section (bordure inférieure) |
| `.form-grid` | Grid responsive (auto-fit, minmax(250px, 1fr)) |
| `.form-group` | Container de champ |
| `.form-group.full-width` | Champ pleine largeur |
| `.form-control` | Input/select/textarea stylisé (44px height) |
| `.form-hint` | Texte d'aide (11px, italic) |
| `.error-message` | Message d'erreur (rouge, 12px) |
| `.required` | Astérisque rouge (*) |
| `.file-upload-container` | Container upload fichier |
| `.file-input-label` | Bouton d'upload stylisé |
| `.image-preview` | Aperçu image (120x80px) |

---

## 8. BOUTONS

### 📍 Fichier de référence : `components.css`

### Classes disponibles

```html
<!-- Bouton primaire (bleu) -->
<button class="btn btn-primary">
  <i class="fas fa-plus"></i> Créer
</button>

<!-- Bouton secondaire (gris foncé) -->
<button class="btn btn-secondary">Annuler</button>

<!-- Bouton succès (vert) -->
<button class="btn btn-success">Valider</button>

<!-- Bouton danger (rouge) -->
<button class="btn btn-danger">Supprimer</button>

<!-- Bouton icône -->
<button class="btn-icon btn-edit">
  <i class="fas fa-edit"></i>
</button>

<button class="btn-icon btn-delete">
  <i class="fas fa-trash"></i>
</button>

<!-- Bouton personnalisé dans filters -->
<button class="btn btn-danger">Effacer</button>
```

### Variantes de taille

```html
<button class="btn btn-sm">Petit</button>
<button class="btn btn-lg">Grand</button>
```

### Propriétés CSS

```css
.btn {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid var(--border-secondary);
  transition: all var(--transition-fast);
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## 9. BADGES ET STATUTS

### 📍 Fichier de référence : `produit-list.component.html` (Boutique)

### Structure HTML

```html
<!-- Badge de statut -->
<span class="statut-badge" [ngClass]="getStatutBadgeClass(produit.statut)">
  {{ getStatutLabel(produit.statut) }}
</span>

<!-- Dans le component -->
getStatutBadgeClass(statut: string): string {
  switch (statut) {
    case 'actif': return 'statut-actif';
    case 'rupture_stock': return 'statut-rupture_stock';
    case 'archive': return 'statut-archive';
  }
}
```

### Classes CSS disponibles

```css
/* Dans components.css */
.badge-libre       { background: var(--color-success); }
.badge-occupe      { background: var(--color-danger); }
.badge-reserve     { background: var(--color-amber-500); }
.badge-en_travaux  { background: var(--color-blue-500); }
.badge-en_negociation { background: var(--color-gray-600); }
```

### Personnalisation dans SCSS

```scss
.statut-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 4px;
}

.statut-actif {
  background-color: #059669;
  color: white;
}

.statut-rupture_stock {
  background-color: #dc2626;
  color: white;
}

.statut-archive {
  background-color: #6b7280;
  color: white;
}
```

---

## 10. RESPONSIVE DESIGN

### 📍 Fichier de référence : `components.css`

### Breakpoints

```css
/* Mobile */
@media (max-width: 768px) {
  .sections-grid {
    grid-template-columns: 1fr;
  }

  .filters {
    flex-direction: column;
  }

  .pagination-container {
    flex-direction: column;
    gap: 12px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions .btn {
    width: 100%;
  }
}

/* Tablette */
@media (min-width: 768px) and (max-width: 991px) {
  .filters-content {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 992px) {
  .filters-content {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Bonnes pratiques

1. **Grid auto-fit** : Utiliser `repeat(auto-fit, minmax(250px, 1fr))`
2. **Flex-wrap** : Permettre le wrapping sur mobile
3. **Boutons pleine largeur** : Sur mobile, `width: 100%`
4. **Modal responsive** : `width: 90%` sur mobile, `max-width: 600px` sur desktop

---

## 11. EXEMPLE COMPLET

### Page CRUD complète

```typescript
// exemple-crud.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-exemple-crud',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './exemple-crud.component.html',
  styleUrls: ['./exemple-crud.component.scss']
})
export class ExempleCrudComponent implements OnInit {
  items: any[] = [];
  filteredItems: any[] = [];
  searchTerm = '';
  showModal = false;
  editingItem: any = null;
  isSubmitting = false;
  itemForm: FormGroup;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  constructor(
    private formBuilder: FormBuilder,
    private toastService: ToastService
  ) {
    this.itemForm = this.formBuilder.group({
      nom: ['', Validators.required],
      description: [''],
      statut: ['actif'],
    });
  }

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    // API call...
  }

  filterItems() {
    this.filteredItems = this.items.filter(item =>
      item.nom.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openCreateModal() {
    this.editingItem = null;
    this.itemForm.reset();
    this.showModal = true;
  }

  editItem(item: any) {
    this.editingItem = item;
    this.itemForm.patchValue(item);
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingItem = null;
    this.itemForm.reset();
  }

  onSubmit() {
    if (this.itemForm.valid) {
      this.isSubmitting = true;
      // API call...
    }
  }

  deleteItem(id: string) {
    if (confirm('Êtes-vous sûr ?')) {
      // API call...
    }
  }
}
```

```html
<!-- exemple-crud.component.html -->
<div class="page-container">
  
  <!-- Filtres -->
  <div class="filters-section">
    <div class="filters-container">
      <div class="filters-header">
        <i class="fa-solid fa-filter"></i>
        <span>Filtres</span>
      </div>
      <div class="filters-content">
        <div class="search-box">
          <input
            type="text"
            placeholder="Rechercher..."
            [(ngModel)]="searchTerm"
            (input)="filterItems()"
          />
        </div>
        <button class="btn btn-danger" (click)="resetFilters()">Effacer</button>
      </div>
    </div>
  </div>

  <!-- Tableau -->
  <div class="table-container">
    <div class="table-header">
      <h3 class="table-title">Liste des Éléments</h3>
      <button class="btn btn-primary" (click)="openCreateModal()">
        <i class="fas fa-plus"></i> Nouveau
      </button>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Description</th>
          <th>Statut</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let item of filteredItems" class="table-row">
          <td>{{ item.nom }}</td>
          <td>{{ item.description }}</td>
          <td>
            <span class="badge" [ngClass]="'badge-' + item.statut">
              {{ item.statut }}
            </span>
          </td>
          <td>
            <div class="action-buttons">
              <button class="btn-icon btn-edit" (click)="editItem(item)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon btn-delete" (click)="deleteItem(item._id)">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="pagination-container" *ngIf="totalPages >= 1">
      <div class="pagination-info">
        <span>Page {{ currentPage }} sur {{ totalPages }}</span>
        <select [(ngModel)]="pageSize" (ngModelChange)="onPageSizeChange()">
          <option *ngFor="let size of [5, 10, 25, 50]" [value]="size">
            {{ size }} par page
          </option>
        </select>
      </div>
      <div class="pagination-controls">
        <button (click)="goToPage(1)" [disabled]="currentPage === 1">
          <i class="fas fa-angle-double-left"></i>
        </button>
        <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">
          <i class="fas fa-angle-left"></i>
        </button>
        <button *ngFor="let p of pages" [class.active]="p === currentPage" (click)="goToPage(p)">
          {{ p }}
        </button>
        <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">
          <i class="fas fa-angle-right"></i>
        </button>
        <button (click)="goToPage(totalPages)" [disabled]="currentPage === totalPages">
          <i class="fas fa-angle-double-right"></i>
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Modal -->
<div *ngIf="showModal" class="modal-overlay" (click)="closeModal()">
  <div class="modal-content" (click)="$event.stopPropagation()">
    <div class="modal-header">
      <h2 class="modal-title">{{ editingItem ? 'Modifier' : 'Nouveau' }}</h2>
      <button class="btn-close" (click)="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <form [formGroup]="itemForm" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <div class="form-group">
            <label>Nom <span class="required">*</span></label>
            <input type="text" formControlName="nom" class="form-control" />
          </div>
          <div class="form-group full-width">
            <label>Description</label>
            <textarea formControlName="description" class="form-control"></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" (click)="closeModal()">Annuler</button>
          <button type="submit" [disabled]="itemForm.invalid" class="btn btn-primary">
            {{ isSubmitting ? 'En cours...' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
```

---

## 🎯 RÉCAPITULATIF DES CLASSES PRINCIPALES

| Composant | Classes |
|-----------|---------|
| **Conteneur** | `.page-container`, `.table-container`, `.filters-container` |
| **Tableau** | `.data-table`, `.table-header`, `.table-row`, `.empty-state` |
| **Filtres** | `.filters-section`, `.filters-header`, `.search-box` |
| **Pagination** | `.pagination-container`, `.pagination-controls`, `.pagination-btn` |
| **Modal** | `.modal-overlay`, `.modal-content`, `.modal-header`, `.modal-body`, `.modal-actions` |
| **Formulaire** | `.form`, `.form-group`, `.form-control`, `.form-grid`, `.form-section` |
| **Boutons** | `.btn`, `.btn-primary`, `.btn-success`, `.btn-danger`, `.btn-icon` |
| **Badges** | `.badge`, `.badge-success`, `.badge-danger`, `.badge-warning` |

---

## 📁 FICHIERS À COPIER

Pour créer une nouvelle page CRUD, copiez depuis :

```
app/admin/components/centres/pages/centre-crud/
├── centre-crud.component.ts       ← Logique TypeScript
├── centre-crud.component.html     ← Template HTML
└── centre-crud.component.scss     ← Styles personnalisés
```

---

**Dernière mise à jour :** 25 février 2026
