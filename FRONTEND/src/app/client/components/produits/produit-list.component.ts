import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProduitClientService, ProduitClient } from '../../services/produit-client.service';
import { ProduitCardComponent } from './produit-card.component';
import { ProduitDetailModalComponent } from './produit-detail-modal.component';

@Component({
  selector: 'app-produit-list',
  standalone: true,
  imports: [CommonModule, ProduitCardComponent, ProduitDetailModalComponent],
  template: `
    <div class="produit-list-page">

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
        <button [disabled]="currentPage <= 1" (click)="goToPage(currentPage - 1)" class="page-btn">
          <i class="fas fa-chevron-left"></i>
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button [disabled]="currentPage >= totalPages" (click)="goToPage(currentPage + 1)" class="page-btn">
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

    .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 24px; }
    .page-btn {
      width: 36px; height: 36px; border-radius: 6px; border: 1px solid #e5e7eb;
      background: white; cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.15s;
    }
    .page-btn:hover:not(:disabled) { border-color: #3660a9; color: #3660a9; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .page-info { font-size: 13px; color: #6b7280; }
  `]
})
export class ClientProduitListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() promo = false; // si vrai, ne charge que les produits en promotion
  produits: ProduitClient[] = [];
  isLoading = false;
  currentPage = 1;
  total = 0;
  limit = 16;
  selectedProduit: ProduitClient | null = null;

  private destroy$ = new Subject<void>();

  get totalPages(): number { return Math.ceil(this.total / this.limit); }

  constructor(private produitService: ProduitClientService) {}

  ngOnInit(): void { this.charger(); }
  ngOnChanges(changes: SimpleChanges): void { if (changes['promo']) { this.currentPage = 1; this.charger(); } }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  charger(): void {
    this.isLoading = true;
    const params: any = { page: this.currentPage, limit: this.limit };
    if (this.promo) {
      params.promo = true;
    }
    this.produitService.getProduits(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => { this.produits = res.produits || []; this.total = res.total || 0; this.isLoading = false; },
        error: () => { this.isLoading = false; }
      });
  }

  goToPage(p: number): void { this.currentPage = p; this.charger(); }
}
