import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CategorieFilter { id: string; nom: string; }

@Injectable({ providedIn: 'root' })
export class FilterService {
  private categoriesSource = new BehaviorSubject<CategorieFilter[]>([]);
  private searchSource = new BehaviorSubject<string>('');

  categories$ = this.categoriesSource.asObservable();
  search$ = this.searchSource.asObservable();

  get selectedCategories(): CategorieFilter[] { return this.categoriesSource.value; }
  get selectedIds(): string[] { return this.categoriesSource.value.map(c => c.id); }
  get currentCategorie(): string { return this.categoriesSource.value[0]?.id ?? ''; }
  get currentSearch(): string { return this.searchSource.value; }

  toggleCategorie(id: string, nom: string = id): void {
    const current = this.categoriesSource.value;
    const exists = current.find(c => c.id === id);
    const next = exists ? current.filter(c => c.id !== id) : [...current, { id, nom }];
    this.categoriesSource.next(next);
  }

  isSelected(id: string): boolean { return this.categoriesSource.value.some(c => c.id === id); }

  clearCategories(): void { this.categoriesSource.next([]); }
  setSearch(q: string): void { this.searchSource.next(q); }
  reset(): void { this.categoriesSource.next([]); this.searchSource.next(''); }
}
