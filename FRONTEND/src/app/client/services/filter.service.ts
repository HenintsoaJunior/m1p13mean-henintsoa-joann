import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FilterService {
  private categorieSource = new BehaviorSubject<string>('');
  private searchSource = new BehaviorSubject<string>('');

  categorie$ = this.categorieSource.asObservable();
  search$ = this.searchSource.asObservable();

  get currentCategorie(): string { return this.categorieSource.value; }
  get currentSearch(): string { return this.searchSource.value; }

  setCategorie(id: string): void { this.categorieSource.next(id); }
  setSearch(q: string): void { this.searchSource.next(q); }
  reset(): void { this.categorieSource.next(''); this.searchSource.next(''); }
}
