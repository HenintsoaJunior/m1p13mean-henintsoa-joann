import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../../services/toast.service';

export interface Categorie {
  _id?: string;
  idBoutique?: string;
  nom: string;
  slug: string;
  description?: string | null;
  idCategorieParent?: string | null;
  urlImage?: string | null;
  dateCreation?: Date;
  dateMiseAJour?: Date;
}

export interface CategorieFormData {
  nom: string;
  slug: string;
  description?: string;
  idCategorieParent?: string;
  urlImage?: string;
}

export interface PaginationResult<T> {
  categories?: T[];
  pagination: {
    page: number;
    limite: number;
    total: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class CategorieService {
  private apiUrl = `${environment.apiUrl}/api/boutique/categories`;
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getCategories(page: number = 1, limit: number = 10): Observable<PaginationResult<Categorie>> {
    return this.http.get<PaginationResult<Categorie>>(`${this.apiUrl}?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  getCategoriesByBoutique(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.apiUrl}/boutique`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  getCategoriesEnfants(idParent: string): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.apiUrl}/parent/${idParent}/enfants`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  getCategorieById(id: string): Observable<Categorie> {
    return this.http.get<Categorie>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  getCategorieBySlug(slug: string): Observable<Categorie> {
    return this.http.get<Categorie>(`${this.apiUrl}/slug/${slug}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  createCategorie(categorie: CategorieFormData): Observable<Categorie> {
    return this.http.post<Categorie>(`${this.apiUrl}`, categorie, {
      headers: this.getAuthHeaders(),
    }).pipe(
      tap(() => this.toastService.showSuccess('Catégorie créée avec succès')),
      catchError(this.handleError.bind(this)),
    );
  }

  updateCategorie(id: string, categorie: CategorieFormData): Observable<Categorie> {
    return this.http.put<Categorie>(`${this.apiUrl}/${id}`, categorie, {
      headers: this.getAuthHeaders(),
    }).pipe(
      tap(() => this.toastService.showSuccess('Catégorie mise à jour avec succès')),
      catchError(this.handleError.bind(this)),
    );
  }

  deleteCategorie(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      tap(() => this.toastService.showSuccess('Catégorie supprimée avec succès')),
      catchError(this.handleError.bind(this)),
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = "Une erreur inattendue s'est produite";

    if (error.error?.erreur) {
      errorMessage = error.error.erreur;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'Impossible de se connecter au serveur';
    } else if (error.status === 401) {
      errorMessage = 'Non authentifié';
    } else if (error.status === 403) {
      errorMessage = 'Accès refusé';
    }

    this.toastService.showError(errorMessage);
    return throwError(() => ({ message: errorMessage }));
  }
}
