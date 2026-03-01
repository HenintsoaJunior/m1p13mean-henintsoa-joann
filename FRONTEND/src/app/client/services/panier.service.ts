import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProduitClient } from './produit-client.service';

export interface PanierItem {
  produit: ProduitClient;
  varianteIndex: number;
  quantite: number;
}

@Injectable({ providedIn: 'root' })
export class PanierService {
  private readonly KEY = 'client_panier';
  private itemsSubject = new BehaviorSubject<PanierItem[]>(this.load());

  items$ = this.itemsSubject.asObservable();

  get count(): number {
    return this.itemsSubject.value.reduce((s, i) => s + i.quantite, 0);
  }

  ajouter(produit: ProduitClient, varianteIndex = 0): void {
    const items = [...this.itemsSubject.value];
    const idx = items.findIndex(i => i.produit._id === produit._id && i.varianteIndex === varianteIndex);
    if (idx >= 0) {
      items[idx] = { ...items[idx], quantite: items[idx].quantite + 1 };
    } else {
      items.push({ produit, varianteIndex, quantite: 1 });
    }
    this.save(items);
  }

  retirer(produitId: string, varianteIndex = 0): void {
    const items = this.itemsSubject.value.filter(i => !(i.produit._id === produitId && i.varianteIndex === varianteIndex));
    this.save(items);
  }

  modifierQuantite(produitId: string, varianteIndex: number, quantite: number): void {
    if (quantite <= 0) { this.retirer(produitId, varianteIndex); return; }
    const items = this.itemsSubject.value.map(i =>
      i.produit._id === produitId && i.varianteIndex === varianteIndex ? { ...i, quantite } : i
    );
    this.save(items);
  }

  vider(): void { this.save([]); }

  estDansPanier(produitId: string): boolean {
    return this.itemsSubject.value.some(i => i.produit._id === produitId);
  }

  private load(): PanierItem[] {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch { return []; }
  }

  private save(items: PanierItem[]): void {
    localStorage.setItem(this.KEY, JSON.stringify(items));
    this.itemsSubject.next(items);
  }
}
