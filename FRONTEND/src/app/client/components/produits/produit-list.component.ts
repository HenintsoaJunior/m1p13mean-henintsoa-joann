import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { ProduitClientService, ProduitClient } from '../../services/produit-client.service';
import { ProduitCardComponent } from './produit-card.component';
import { ProduitDetailModalComponent } from './produit-detail-modal.component';
import { FilterService, CategorieFilter } from '../../services/filter.service';

@Component({
  selector: 'app-produit-list',
  standalone: true,
  imports: [CommonModule, ProduitCardComponent, ProduitDetailModalComponent],
  template: `
    <div class="produit-list-page">

      <!-- Active filters indicator -->
      <div class="active-filters" *ngIf="activeCategories.length > 0 || activeSearch">
        <span class="filter-badge" *ngFor="let cat of activeCategories">
          <i class="fas fa-tag"></i> {{ cat.nom }}
          <button class="filter-clear" (click)="filterService.toggleCategorie(cat.id, cat.nom)" title="Retirer">×</button>
        </span>
        <span class="filter-badge search-badge" *ngIf="activeSearch">
          <i class="fas fa-search"></i> "{{ activeSearch }}"
          <button class="filter-clear" (click)="filterService.setSearch('')" title="Effacer">×</button>
        </span>
        <button class="btn-reset-all" *ngIf="activeCategories.length > 1" (click)="filterService.clearCategories()">
          <i class="fas fa-times-circle"></i> Tout effacer
        </button>
      </div>

      <!-- Products -->
      <div *ngIf="isLoading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i> Chargement des produits…
      </div>
      <div *ngIf="!isLoading && produits.length === 0" class="empty-state">
        <i class="fas fa-box-open"></i>
        <p>Aucun produit trouvé.</p>
      </div>
      <div class="produit-grid" *ngIf="!isLoading && produits.length > 0">
        <app-produit-card
          *ngFor="let p of produits"
          [produit]="p"
          (openDetail)="selectedProduit = p">
        </app-produit-card>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="totalPages > 1">
        <button [disabled]="currentPage <= 1" (click)="goToPage(currentPage - 1)" class="page-btn" title="Précédent">
          <i class="fas fa-chevron-left"></i>
        </button>
        <ng-container *ngFor="let p of pageNumbers">
          <span *ngIf="p === '...'" class="page-ellipsis">…</span>
          <button
            *ngIf="p !== '...'"
            class="page-btn page-num"
            [class.active]="p === currentPage"
            (click)="goToPage(+p)"
          >{{ p }}</button>
        </ng-container>
        <button [disabled]="currentPage >= totalPages" (click)="goToPage(currentPage + 1)" class="page-btn" title="Suivant">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

    </div>

    <!-- Product Detail Modal -->
    <app-produit-detail-modal
      *ngIf="selectedProduit"
      [produit]="selectedProduit"
      (fermer)="selectedProduit = null">
    </app-produit-detail-modal>
  `,
  styles: [`
    .produit-list-page { padding: 20px 24px; }

    .active-filters {
      display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; align-items: center;
    }
    .filter-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: #eef2fb; color: #3660a9; border: 1px solid #c7d8f5;
      border-radius: 20px; padding: 4px 10px; font-size: 12px; font-weight: 600;
      max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .filter-badge.search-badge { background: #fef3c7; color: #92400e; border-color: #fcd34d; }
    .filter-clear {
      background: none; border: none; color: inherit; cursor: pointer;
      font-size: 16px; line-height: 1; padding: 0 0 0 2px; font-weight: 700; flex-shrink: 0;
    }
    .btn-reset-all {
      display: inline-flex; align-items: center; gap: 5px;
      background: none; border: 1px solid #fca5a5; color: #dc2626; border-radius: 20px;
      padding: 4px 10px; font-size: 12px; font-weight: 600; cursor: pointer;
      transition: all 0.15s;
    }
    .btn-reset-all:hover { background: #fef2f2; }

    .produit-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .loading-state, .empty-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 60px 20px; gap: 14px; color: #9ca3af; font-size: 15px;
    }
    .loading-state i, .empty-state i { font-size: 40px; opacity: 0.4; }

    .pagination {
      display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 28px; flex-wrap: wrap;
    }
    .page-btn {
      min-width: 36px; height: 36px; padding: 0 6px; border-radius: 6px; border: 1px solid #e5e7eb;
      background: white; cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.15s; font-size: 13px; color: #374151;
    }
    .page-btn:hover:not(:disabled) { border-color: #3660a9; color: #3660a9; background: #eef2fb; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .page-btn.active { background: #3660a9; color: white; border-color: #3660a9; font-weight: 700; }
    .page-ellipsis { color: #9ca3af; font-size: 14px; padding: 0 4px; line-height: 36px; }
  `]
})
export class ClientProduitListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() promo = false;
  produits: ProduitClient[] = [];
  isLoading = false;
  currentPage = 1;
  total = 0;
  limit = 16;
  selectedProduit: ProduitClient | null = null;

  activeCategories: CategorieFilter[] = [];
  activeSearch = '';

  filterService = inject(FilterService);
  private destroy$ = new Subject<void>();

  get totalPages(): number { return Math.ceil(this.total / this.limit); }

  get pageNumbers(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [1];
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  }

  constructor(private produitService: ProduitClientService) {}

  ngOnInit(): void {
    combineLatest([this.filterService.categories$, this.filterService.search$])
      .pipe(takeUntil(this.destroy$), debounceTime(0))
      .subscribe(([cats, q]) => {
        this.activeCategories = cats;
        this.activeSearch = q;
        this.currentPage = 1;
        this.charger();
      });  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['promo']) { this.currentPage = 1; this.charger(); }
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  charger(): void {
    this.isLoading = true;
    const params: any = { page: this.currentPage, limit: this.limit };
    if (this.promo) params.promo = true;
    if (this.activeCategories.length > 0) params.categorie = this.activeCategories.map(c => c.id).join(',');
    if (this.activeSearch) params.q = this.activeSearch;

    this.produitService.getProduits(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.produits = res.produits || [];
          this.total = res.total || 0;
          this.isLoading = false;
          const avecPromo = this.produits.filter(p => p.promotion);
          console.log(`[PROMO DEBUG] Reçu: ${this.produits.length} produits, ${avecPromo.length} avec promotion`);
          // Log brut du 1er produit pour voir si promotion est présent dans la réponse API
          if (this.produits.length > 0) {
            console.log('[PROMO RAW] Premier produit:', JSON.stringify(this.produits[0], null, 2));
          }
          if (avecPromo.length > 0) {
            console.log('[PROMO DEBUG] Premier produit avec promo:', avecPromo[0].nom, avecPromo[0].promotion);
          }
        },
        error: (e) => { console.error('[PROMO DEBUG] Erreur getProduits:', e); this.isLoading = false; }
      });
  }

  goToPage(p: number): void { this.currentPage = p; this.charger(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
}
