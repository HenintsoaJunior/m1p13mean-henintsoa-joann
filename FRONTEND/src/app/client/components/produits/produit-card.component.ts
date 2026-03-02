import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProduitClient } from '../../services/produit-client.service';
import { PanierService } from '../../services/panier.service';
import { SouhaitService } from '../../services/souhait.service';

@Component({
  selector: 'app-produit-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class.souhaite]="isSouhaite">
      <!-- Image -->
      <div class="card-img-wrap" (click)="onOpenDetail()">
        <img
          *ngIf="produit.images && produit.images.length > 0; else noImg"
          [src]="produit.images[0]"
          [alt]="produit.nom"
          class="card-img"
        />
        <ng-template #noImg>
          <div class="card-no-img"><i class="fas fa-box-open"></i></div>
        </ng-template>
        <!-- Wishlist btn -->
        <button
          class="btn-souhait"
          (click)="toggleSouhait($event)"
          [class.active]="isSouhaite"
          title="Ajouter aux souhaits"
        >
          <i class="fas fa-heart"></i>
        </button>
        <!-- Badge stock -->
        <span class="badge-stock" *ngIf="!enStock">Rupture</span>
        <span class="badge-promo" *ngIf="produit.promotion">Promo</span>
        <!-- Detail hover overlay -->
        <div class="img-overlay">
          <span><i class="fas fa-eye"></i> Voir détails</span>
        </div>
      </div>

      <!-- Info -->
      <div class="card-body">
        <div class="card-category" *ngIf="produit.idCategorie">{{ produit.idCategorie.nom }}</div>
        <h4 class="card-title" [title]="produit.nom" (click)="onOpenDetail()">{{ produit.nom }}</h4>
        <div class="card-boutique" *ngIf="produit.idBoutique?.contact?.nom">
          <i class="fas fa-store"></i> {{ produit.idBoutique!.contact.nom }}
        </div>

        <!-- Variant hint (if variants) -->
        <div class="variante-hint" *ngIf="produit.variantes && produit.variantes.length > 0">
          <i class="fas fa-palette"></i>
          {{ produit.variantes.length }} variante{{
            produit.variantes.length > 1 ? 's' : ''
          }}
          disponible{{ produit.variantes.length > 1 ? 's' : '' }}
        </div>

        <!-- Price: only if NO variants -->
        <div class="card-price" *ngIf="!produit.variantes || produit.variantes.length === 0">
          <span *ngIf="prixPromo !== null" class="old-price"
            >{{ prixSelected | number: '1.0-0' }} {{ devise }}</span
          >
          <span class="current-price"
            >{{ (prixPromo !== null ? prixPromo : prixSelected) | number: '1.0-0' }}
            {{ devise }}</span
          >
        </div>
        <div class="card-actions">
          <button
            class="btn-cart"
            (click)="addToCart()"
            [disabled]="!enStock"
            [class.added]="dansLePanier"
          >
            <i
              class="fas"
              [class.fa-shopping-cart]="!dansLePanier"
              [class.fa-check]="dansLePanier"
            ></i>
            {{ dansLePanier ? 'Ajouté' : 'Ajouter' }}
          </button>
          <button class="btn-detail" (click)="onOpenDetail()" title="Voir les détails">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        overflow: hidden;
        transition:
          transform 0.15s,
          box-shadow 0.15s;
        display: flex;
        flex-direction: column;
      }
      .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
      }

      .card-img-wrap {
        position: relative;
        height: 180px;
        overflow: hidden;
        background: #f3f4f6;
        cursor: pointer;
      }
      .card-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.25s;
      }
      .card-img-wrap:hover .card-img {
        transform: scale(1.04);
      }
      .card-no-img {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #d1d5db;
        font-size: 40px;
      }

      .img-overlay {
        position: absolute;
        inset: 0;
        background: rgba(54, 96, 169, 0.55);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s;
        span {
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }
      }
      .card-img-wrap:hover .img-overlay {
        opacity: 1;
      }

      .btn-souhait {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: white;
        border: 1px solid #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s;
        z-index: 2;
      }
      .btn-souhait i {
        color: #d1d5db;
        font-size: 13px;
        transition: color 0.15s;
      }
      .btn-souhait:hover i,
      .btn-souhait.active i {
        color: #ef4444;
      }
      .btn-souhait.active {
        border-color: #ef4444;
        background: #fff1f2;
      }

      .badge-stock {
        position: absolute;
        top: 8px;
        left: 8px;
        background: #ef4444;
        color: white;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 4px;
        text-transform: uppercase;
        z-index: 2;
      }
      .badge-promo {
        position: absolute;
        top: 8px;
        right: 8px;
        background: #f59e0b;
        color: white;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 4px;
        text-transform: uppercase;
        z-index: 2;
      }

      .card-body {
        padding: 10px 12px 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
      }
      .card-category {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #3660a9;
      }
      .card-title {
        font-size: 13.5px;
        font-weight: 600;
        color: #111827;
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
        &:hover {
          color: #3660a9;
        }
      }
      .card-boutique {
        font-size: 11px;
        color: #9ca3af;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .card-boutique i {
        font-size: 10px;
      }

      .variante-hint {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 11.5px;
        color: #3660a9;
        font-weight: 600;
        background: #eff6ff;
        padding: 3px 8px;
        border-radius: 20px;
        width: fit-content;
        margin: 2px 0;
        i {
          font-size: 10px;
        }
      }

      .card-price {
        font-size: 16px;
        font-weight: 700;
        color: #3660a9;
      }
      .card-price .old-price {
        text-decoration: line-through;
        color: #9ca3af;
        margin-right: 6px;
        font-size: 14px;
      }
      .card-price .current-price {
        color: #ef4444;
      }

      .card-actions {
        display: flex;
        gap: 6px;
        margin-top: 4px;
      }

      .btn-cart {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 7px 8px;
        border: none;
        border-radius: 6px;
        background: #3660a9;
        color: white;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s;
        &:hover:not(:disabled) {
          background: #2a4d8a;
        }
        &:disabled {
          background: #d1d5db;
          color: #9ca3af;
          cursor: not-allowed;
        }
        &.added {
          background: #059669;
        }
        &.added:hover {
          background: #047857;
        }
      }

      .btn-detail {
        width: 34px;
        height: 34px;
        border-radius: 6px;
        border: 1px solid #e5e7eb;
        background: #f9fafb;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        color: #6b7280;
        transition: all 0.15s;
        flex-shrink: 0;
        &:hover {
          border-color: #3660a9;
          color: #3660a9;
          background: #eff6ff;
        }
      }
    `,
  ],
})
export class ProduitCardComponent {
  @Input() produit!: ProduitClient;
  @Output() openDetail = new EventEmitter<ProduitClient>();

  selectedIdx = 0;

  constructor(
    private panierService: PanierService,
    private souhaitService: SouhaitService,
  ) {}

  get selectedVariante() {
    return this.produit.variantes?.[this.selectedIdx] ?? null;
  }

  get prixSelected(): number {
    if (!this.produit.variantes?.length) return 0;
    return (
      this.selectedVariante?.prix.montant ??
      Math.min(...this.produit.variantes.map((v) => v.prix.montant))
    );
  }

  get prixPromo(): number | null {
    const promo = this.produit.promotion as any;
    if (!promo) return null;
    // if promotion targets a variant, ensure the current selected variant matches
    if (promo.idVariante) {
      const variant = this.produit.variantes?.[this.selectedIdx];
      if (!variant || variant._id !== promo.idVariante) {
        return null;
      }
    }
    const base = this.prixSelected;
    if (promo.type === 'pourcentage') {
      return Math.max(0, Math.round(base * (1 - promo.valeur / 100)));
    }
    if (promo.type === 'montant') {
      return Math.max(0, base - promo.valeur);
    }
    return null;
  }

  get devise(): string {
    return this.produit.variantes?.[0]?.prix?.devise || 'Ar';
  }

  get enStock(): boolean {
    if (!this.produit.variantes?.length) return false;
    return (this.selectedVariante?.stock.quantite ?? 0) > 0;
  }

  get isSouhaite(): boolean {
    return this.souhaitService.estSouhaite(this.produit._id);
  }
  get dansLePanier(): boolean {
    return this.panierService.estDansPanier(this.produit._id);
  }

  selectVar(idx: number): void {
    if ((this.produit.variantes?.[idx]?.stock.quantite ?? 0) === 0) return;
    this.selectedIdx = idx;
  }

  getLabel(v: any): string {
    return [v.couleur, v.unite].filter(Boolean).join(' · ') || 'Variante';
  }

  toggleSouhait(e: Event): void {
    e.stopPropagation();
    this.souhaitService.basculer(this.produit);
  }
  addToCart(): void {
    this.panierService.ajouter(this.produit, this.selectedIdx);
  }
  onOpenDetail(): void {
    this.openDetail.emit(this.produit);
  }
}
