import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CategorieTree {
  _id?: string;
  nom: string;
  slug: string;
  description?: string | null;
  urlImage?: string | null;
  idCategorieParent?: string | null;
  children: CategorieTree[];
}

@Injectable({ providedIn: 'root' })
export class ClientCategorieService {
  private apiUrl = `${environment.apiUrl}/api/public/categories/arbre`;
  private http = inject(HttpClient);

  getCategoriesArbre(): Observable<{ arbre: CategorieTree[] }> {
    return this.http.get<{ arbre: CategorieTree[] }>(this.apiUrl);
  }
}
