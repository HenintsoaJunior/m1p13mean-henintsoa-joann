import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProduitClient } from '../../services/produit-client.service';
import { PanierService } from '../../services/panier.service';
import { SouhaitService } from '../../services/souhait.service';

@Component({
  selector: 'app-produit-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="onClose()"></div>

    <div class="modal-sheet">
      <button class="btn-x" (click)="onClose()"><i class="fas fa-times"></i></button>

      <!-- LEFT: Visual panel -->
      <div class="visual-panel">
        <div class="main-photo">
          <img *ngIf="currentImage; else noPhoto" [src]="currentImage" [alt]="produit.nom" />
          <ng-template #noPhoto>
            <div class="no-photo"><i class="fas fa-box-open"></i></div>
          </ng-template>
          <span class="tag-rupture" *ngIf="!enStock">Rupture</span>
        </div>

        <div class="thumb-strip" *ngIf="produit.images && produit.images.length > 1">
          <button *ngFor="let img of produit.images; let i = index"
                  class="thumb" [class.active]="currentImageIdx === i"
                  (click)="currentImageIdx = i">
            <img [src]="img" />
          </button>
        </div>

        <div class="boutique-chip" *ngIf="produit.idBoutique?.contact?.nom">
          <i class="fas fa-store"></i>
          {{ produit.idBoutique!.contact.nom }}
        </div>
      </div>

      <!-- RIGHT: Info panel -->
      <div class="info-panel">
        <div class="meta-row">
          <span class="cat-chip" *ngIf="produit.idCategorie">{{ produit.idCategorie.nom }}</span>
          <button class="wish-toggle" [class.wished]="isSouhaite" (click)="toggleSouhait()">
            <i class="fas fa-heart"></i>
            <span>{{ isSouhaite ? 'Souhaité' : 'Souhaiter' }}</span>
          </button>
        </div>

        <h1 class="prod-title">{{ produit.nom }}</h1>

        <p class="prod-desc" *ngIf="produit.description">{{ produit.description }}</p>
        <div class="desc-placeholder" *ngIf="!produit.description">
          <i class="fas fa-info-circle"></i> Aucune description disponible.
        </div>

        <div class="divider"></div>

        <!-- Variants -->
        <div class="section" *ngIf="produit.variantes && produit.variantes.length > 0">
          <div class="var-grid">
            <button *ngFor="let v of produit.variantes; let i = index"
                    class="var-card"
                    [class.selected]="selectedIdx === i"
                    [class.oos]="v.stock.quantite === 0"
                    (click)="selectVariante(i)">
              <!-- Radio indicator -->
              <span class="radio-ring" [class.checked]="selectedIdx === i"></span>
              <!-- Color swatch -->
              <span class="color-swatch" *ngIf="v.couleurHex" [style.background]="v.couleurHex"></span>
              <!-- Info -->
              <span class="var-info">
                <span class="var-name">{{ getVarianteLabel(v) }}</span>
                <span class="var-qty" [class.in-stock]="v.stock.quantite > 0" [class.out-stock]="v.stock.quantite === 0">
                  {{ v.stock.quantite > 0 ? v.stock.quantite + ' dispo' : 'Épuisé' }}
                </span>
              </span>
            </button>
          </div>
        </div>

        <!-- Price -->
        <div class="price-block" *ngIf="selectedVariante" style="margin-top: 8px;">
          <span class="price-main">{{ selectedVariante.prix.montant | number:'1.0-0' }}</span>
          <span class="price-cur">{{ selectedVariante.prix.devise }}</span>
        </div>

        <!-- Quantity -->
        <div class="section" *ngIf="enStock">
          <div class="qty-row-label">
            <span class="section-title">Quantité</span>
            <div class="qty-ctrl">
              <button class="q-btn" (click)="qty > 1 ? qty = qty - 1 : null"><i class="fas fa-minus"></i></button>
              <span class="q-num">{{ qty }}</span>
              <button class="q-btn"
                      (click)="qty = qty + 1"
                      [disabled]="selectedVariante && qty >= selectedVariante.stock.quantite">
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="action-row">
          <button class="btn-add"
                  (click)="addToCart()"
                  [disabled]="!enStock || dansLePanier"
                  [class.in-cart]="dansLePanier">
            <i class="fas" [class.fa-cart-plus]="!dansLePanier" [class.fa-check-circle]="dansLePanier"></i>
            {{ dansLePanier ? 'Dans le panier' : 'Ajouter au panier' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed; inset: 0;
      background: rgba(10,15,30,0.6);
      backdrop-filter: blur(4px);
      z-index: 2000;
      animation: bdin 0.2s ease;
    }
    @keyframes bdin { from { opacity: 0; } to { opacity: 1; } }

    .modal-sheet {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2100;
      width: 900px; max-width: 96vw; max-height: 92vh;
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 32px 80px rgba(0,0,0,0.28);
      display: flex; overflow: hidden;
      animation: sheetin 0.28s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes sheetin {
      from { opacity: 0; transform: translate(-50%,-46%) scale(0.96); }
      to   { opacity: 1; transform: translate(-50%,-50%) scale(1); }
    }

    .btn-x {
      position: absolute; top: 14px; right: 14px; z-index: 10;
      width: 34px; height: 34px; border-radius: 50%;
      border: none; background: rgba(255,255,255,0.9);
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      cursor: pointer; font-size: 13px; color: #444;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s, transform 0.15s;
    }
    .btn-x:hover { background: #fff; transform: rotate(90deg); }

    .visual-panel {
      flex: 0 0 42%;
      background: linear-gradient(160deg, #f0f4ff 0%, #e8edf8 100%);
      display: flex; flex-direction: column;
      padding: 24px; gap: 14px; position: relative;
    }

    .main-photo {
      flex: 1; border-radius: 14px; overflow: hidden;
      background: #e2e8f0; position: relative; min-height: 260px;
    }
    .main-photo img { width: 100%; height: 100%; object-fit: cover; }
    .no-photo {
      width: 100%; height: 100%; min-height: 260px;
      display: flex; align-items: center; justify-content: center;
      color: #94a3b8; font-size: 56px;
    }
    .tag-rupture {
      position: absolute; top: 10px; left: 10px;
      background: #ef4444; color: #fff;
      font-size: 10px; font-weight: 800; text-transform: uppercase;
      letter-spacing: 0.06em; padding: 3px 10px; border-radius: 6px;
    }
    .thumb-strip { display: flex; gap: 8px; flex-wrap: wrap; }
    .thumb {
      width: 56px; height: 56px; border-radius: 10px; overflow: hidden;
      border: 2px solid transparent; cursor: pointer;
      background: #e2e8f0; padding: 0; transition: border-color 0.15s, transform 0.1s;
    }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }
    .thumb.active { border-color: #3660a9; }
    .thumb:hover { border-color: #6b8fd4; transform: scale(1.05); }

    .boutique-chip {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,0.7); border-radius: 20px;
      padding: 5px 12px; font-size: 12px; color: #475569; font-weight: 600; width: fit-content;
    }
    .boutique-chip i { font-size: 11px; color: #3660a9; }

    .info-panel {
      flex: 1; padding: 28px 28px 24px;
      display: flex; flex-direction: column; gap: 14px;
      overflow-y: auto;
    }
    .info-panel::-webkit-scrollbar { width: 4px; }
    .info-panel::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

    .meta-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    .cat-chip {
      font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;
      color: #3660a9; background: #eff6ff; padding: 3px 12px; border-radius: 20px;
    }
    .wish-toggle {
      display: flex; align-items: center; gap: 6px;
      border: 1.5px solid #e2e8f0; border-radius: 20px;
      background: #fff; padding: 5px 13px;
      font-size: 12px; font-weight: 600; cursor: pointer; color: #94a3b8;
      transition: all 0.2s;
    }
    .wish-toggle i { font-size: 12px; transition: color 0.2s; }
    .wish-toggle:hover { border-color: #fca5a5; color: #ef4444; }
    .wish-toggle:hover i { color: #ef4444; }
    .wish-toggle.wished { border-color: #ef4444; background: #fff1f2; color: #ef4444; }
    .wish-toggle.wished i { color: #ef4444; }

    .prod-title { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; line-height: 1.25; }
    .prod-desc { font-size: 13.5px; color: #64748b; line-height: 1.7; margin: 0; }
    .desc-placeholder {
      font-size: 13px; color: #94a3b8; font-style: italic;
      display: flex; align-items: center; gap: 6px;
    }
    .desc-placeholder i { font-size: 12px; }
    .divider { height: 1px; background: #f1f5f9; margin: 2px 0; }

    .section { display: flex; flex-direction: column; gap: 10px; }
    .section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; }

    .var-grid { display: flex; flex-wrap: wrap; gap: 10px; }

    .var-card {
      position: relative;
      display: flex; align-items: center; gap: 10px;
      padding: 10px 16px 10px 12px;
      border-radius: 14px;
      border: 2px solid #e2e8f0;
      background: #f8fafc;
      cursor: pointer;
      min-width: 130px;
      text-align: left;
      transition: border-color 0.2s, background 0.2s, transform 0.18s, box-shadow 0.2s;
      overflow: hidden;
    }
    .var-card::before {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      opacity: 0; transition: opacity 0.2s;
    }
    .var-card:hover:not(.oos) {
      border-color: #93c5fd;
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(54,96,169,0.14);
    }
    .var-card:hover:not(.oos)::before { opacity: 1; }
    .var-card.selected {
      border-color: #3660a9;
      box-shadow: 0 6px 20px rgba(54,96,169,0.22);
    }
    .var-card.selected::before { opacity: 1; }
    .var-card.oos { opacity: 0.45; cursor: not-allowed; }

    /* Radio ring — square */
    .radio-ring {
      position: relative; z-index: 1;
      width: 18px; height: 18px; border-radius: 4px; flex-shrink: 0;
      border: 2px solid #cbd5e1; background: #fff;
      display: flex; align-items: center; justify-content: center;
      transition: border-color 0.2s, background 0.2s, transform 0.15s;
    }
    .radio-ring.checked {
      border-color: #3660a9; background: #3660a9;
      transform: scale(1.1);
    }
    .radio-ring.checked::after {
      content: '';
      display: block;
      width: 6px; height: 6px;
      border-radius: 1px;
      background: #fff;
    }

    /* Color swatch */
    .color-swatch {
      position: relative; z-index: 1;
      width: 26px; height: 26px; border-radius: 8px; flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(255,255,255,0.3);
    }

    /* Text info */
    .var-info {
      position: relative; z-index: 1;
      display: flex; flex-direction: column; gap: 3px; flex: 1;
    }
    .var-name { font-size: 13px; font-weight: 700; color: #1e293b; line-height: 1; }
    .var-card.selected .var-name { color: #1e40af; }
    .var-qty { font-size: 10px; font-weight: 700; letter-spacing: 0.03em; }
    .var-qty.in-stock { color: #16a34a; }
    .var-qty.out-stock { color: #dc2626; }

    @keyframes popIn {
      from { transform: scale(0); opacity: 0; }
      to   { transform: scale(1); opacity: 1; }
    }


    /* Price */
    .price-block {
      display: flex; align-items: flex-end; gap: 8px;
      padding: 14px 18px;
      background: linear-gradient(135deg, #f0f7ff 0%, #e8f0fc 100%);
      border-radius: 14px;
      border-left: 4px solid #3660a9;
    }
    .price-main {
      font-size: 36px; font-weight: 900; line-height: 1;
      color: #1e3a7b;
      letter-spacing: -0.5px;
    }
    .price-cur {
      font-size: 15px; font-weight: 800; color: #3660a9;
      padding-bottom: 4px;
      text-transform: uppercase; letter-spacing: 0.05em;
    }

    .qty-row-label {
      display: flex; align-items: center; justify-content: space-between;
    }
    .qty-ctrl { display: inline-flex; align-items: center; border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden; width: fit-content; }
    .q-btn {
      width: 38px; height: 38px; border: none; background: #f8fafc;
      cursor: pointer; font-size: 12px; color: #374151;
      display: flex; align-items: center; justify-content: center; transition: background 0.15s, color 0.15s;
    }
    .q-btn:hover:not(:disabled) { background: #3660a9; color: #fff; }
    .q-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .q-num {
      min-width: 44px; text-align: center;
      font-size: 16px; font-weight: 800; color: #0f172a;
      background: #fff; height: 38px; display: flex; align-items: center; justify-content: center;
      border-left: 2px solid #e2e8f0; border-right: 2px solid #e2e8f0;
    }

    .action-row { display: flex; gap: 10px; margin-top: 4px; }
    .btn-add {
      flex: 1; padding: 14px 20px;
      border: none; border-radius: 12px;
      background: linear-gradient(135deg, #3660a9 0%, #1e40af 100%);
      color: #fff; font-size: 15px; font-weight: 800;
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 9px;
      letter-spacing: 0.01em;
      transition: transform 0.15s, box-shadow 0.2s, opacity 0.15s;
    }
    .btn-add i { font-size: 16px; }
    .btn-add:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(54,96,169,0.4); }
    .btn-add:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
    .btn-add.in-cart { background: linear-gradient(135deg, #059669, #047857); }

    @media (max-width: 640px) {
      .modal-sheet { flex-direction: column; }
      .visual-panel { flex: none; max-height: 280px; }
      .main-photo { min-height: 160px; }
    }
  `]
})
export class ProduitDetailModalComponent implements OnInit {
  @Input() produit!: ProduitClient;
  @Output() fermer = new EventEmitter<void>();

  selectedIdx = 0;
  currentImageIdx = 0;
  qty = 1;

  constructor(public panierService: PanierService, public souhaitService: SouhaitService) {}

  ngOnInit(): void {
    const firstInStock = this.produit.variantes?.findIndex(v => v.stock.quantite > 0) ?? -1;
    this.selectedIdx = firstInStock >= 0 ? firstInStock : 0;
  }

  get currentImage(): string | null {
    if (!this.produit.images?.length) return null;
    return this.produit.images[this.currentImageIdx] || this.produit.images[0];
  }

  get selectedVariante() { return this.produit.variantes?.[this.selectedIdx] ?? null; }
  get enStock(): boolean { return (this.selectedVariante?.stock.quantite ?? 0) > 0; }
  get isSouhaite(): boolean { return this.souhaitService.estSouhaite(this.produit._id); }
  get dansLePanier(): boolean { return this.panierService.estDansPanier(this.produit._id); }

  selectVariante(idx: number): void {
    if ((this.produit.variantes?.[idx]?.stock.quantite ?? 0) === 0) return;
    this.selectedIdx = idx; this.qty = 1;
  }

  getVarianteLabel(v: any): string {
    return [v.couleur, v.unite].filter(Boolean).join(' · ') || 'Variante';
  }

  addToCart(): void {
    for (let i = 0; i < this.qty; i++) {
      this.panierService.ajouter(this.produit, this.selectedIdx);
    }
  }

  toggleSouhait(): void { this.souhaitService.basculer(this.produit); }
  onClose(): void { this.fermer.emit(); }
}
