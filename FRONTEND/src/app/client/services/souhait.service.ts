import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProduitClient } from './produit-client.service';

@Injectable({ providedIn: 'root' })
export class SouhaitService {
  private readonly KEY = 'client_souhaits';
  private itemsSubject = new BehaviorSubject<ProduitClient[]>(this.load());

  items$ = this.itemsSubject.asObservable();

  get count(): number { return this.itemsSubject.value.length; }

  basculer(produit: ProduitClient): void {
    const items = this.itemsSubject.value;
    const idx = items.findIndex(p => p._id === produit._id);
    const next = idx >= 0 ? items.filter(p => p._id !== produit._id) : [...items, produit];
    this.save(next);
  }

  estSouhaite(produitId: string): boolean {
    return this.itemsSubject.value.some(p => p._id === produitId);
  }

  private load(): ProduitClient[] {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch { return []; }
  }

  private save(items: ProduitClient[]): void {
    localStorage.setItem(this.KEY, JSON.stringify(items));
    this.itemsSubject.next(items);
  }
}
