import { Component, Input } from '@angular/core';
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
      <div class="card-img-wrap">
        <img *ngIf="produit.images && produit.images.length > 0; else noImg"
             [src]="produit.images[0]" [alt]="produit.nom" class="card-img" />
        <ng-template #noImg>
          <div class="card-no-img"><i class="fas fa-box-open"></i></div>
        </ng-template>
        <!-- Wishlist btn -->
        <button class="btn-souhait" (click)="toggleSouhait($event)" [class.active]="isSouhaite" title="Ajouter aux souhaits">
          <i class="fas fa-heart"></i>
        </button>
        <!-- Badge stock -->
        <span class="badge-stock" *ngIf="!enStock">Rupture</span>
      </div>

      <!-- Info -->
      <div class="card-body">
        <div class="card-category" *ngIf="produit.idCategorie">{{ produit.idCategorie.nom }}</div>
        <h4 class="card-title" [title]="produit.nom">{{ produit.nom }}</h4>
        <div class="card-boutique" *ngIf="produit.idBoutique?.contact?.nom">
          <i class="fas fa-store"></i> {{ produit.idBoutique!.contact.nom }}
        </div>
        <div class="card-price">{{ prixMin | number:'1.0-0' }} {{ devise }}</div>
        <button class="btn-cart" (click)="addToCart()" [disabled]="!enStock" [class.added]="dansLePanier">
          <i class="fas" [class.fa-shopping-cart]="!dansLePanier" [class.fa-check]="dansLePanier"></i>
          {{ dansLePanier ? 'Ajouté' : 'Ajouter au panier' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
      transition: transform 0.15s, box-shadow 0.15s;
      display: flex;
      flex-direction: column;
      cursor: pointer;
    }
    .card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }

    .card-img-wrap { position: relative; height: 180px; overflow: hidden; background: #f3f4f6; }
    .card-img { width: 100%; height: 100%; object-fit: cover; }
    .card-no-img { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #d1d5db; font-size: 40px; }

    .btn-souhait {
      position: absolute; top: 8px; right: 8px;
      width: 32px; height: 32px; border-radius: 50%;
      background: white; border: 1px solid #e5e7eb;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.15s;
    }
    .btn-souhait i { color: #d1d5db; font-size: 13px; transition: color 0.15s; }
    .btn-souhait:hover i, .btn-souhait.active i { color: #ef4444; }
    .btn-souhait.active { border-color: #ef4444; background: #fff1f2; }

    .badge-stock {
      position: absolute; top: 8px; left: 8px;
      background: #ef4444; color: white;
      font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px;
      text-transform: uppercase;
    }

    .card-body { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 5px; flex: 1; }
    .card-category { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #3660a9; }
    .card-title { font-size: 14px; font-weight: 600; color: #111827; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .card-boutique { font-size: 11.5px; color: #9ca3af; display: flex; align-items: center; gap: 5px; }
    .card-boutique i { font-size: 10px; }
    .card-price { font-size: 16px; font-weight: 700; color: #3660a9; margin-top: 4px; }

    .btn-cart {
      display: flex; align-items: center; justify-content: center; gap: 7px;
      padding: 8px 12px; border: none; border-radius: 6px;
      background: #3660a9; color: white;
      font-size: 13px; font-weight: 600; cursor: pointer;
      transition: background 0.15s; margin-top: 6px;
    }
    .btn-cart:hover:not(:disabled) { background: #2a4d8a; }
    .btn-cart:disabled { background: #d1d5db; color: #9ca3af; cursor: not-allowed; }
    .btn-cart.added { background: #059669; }
    .btn-cart.added:hover { background: #047857; }
  `]
})
export class ProduitCardComponent {
  @Input() produit!: ProduitClient;

  constructor(private panierService: PanierService, private souhaitService: SouhaitService) {}

  get prixMin(): number {
    if (!this.produit.variantes?.length) return 0;
    return Math.min(...this.produit.variantes.map(v => v.prix.montant));
  }

  get devise(): string {
    return this.produit.variantes?.[0]?.prix?.devise || 'Ar';
  }

  get enStock(): boolean {
    if (!this.produit.variantes?.length) return false;
    return this.produit.variantes.some(v => v.stock.quantite > 0);
  }

  get isSouhaite(): boolean { return this.souhaitService.estSouhaite(this.produit._id); }
  get dansLePanier(): boolean { return this.panierService.estDansPanier(this.produit._id); }

  toggleSouhait(e: Event): void { e.stopPropagation(); this.souhaitService.basculer(this.produit); }
  addToCart(): void { this.panierService.ajouter(this.produit, 0); }
}
