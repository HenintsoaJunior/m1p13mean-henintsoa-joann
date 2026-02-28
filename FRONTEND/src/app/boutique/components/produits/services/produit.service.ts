import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../../services/toast.service';

export interface ProduitVariante {
  couleur: string;
  couleurHex: string;
  unite: string;  // Peut être une taille (S, M, L), un volume (75cl), un poids (1kg), etc.
  typeUnitePrincipal?: string;
  prix: {
    devise: string;
    montant: number;
  };
  stock: {
    quantite: number;
  };
}

export interface Produit {
  _id?: string;
  idBoutique?: string;
  idCategorie: string | { _id: string; nom: string; slug?: string };
  nom: string;
  slug: string;
  description?: string | null;
  prix?: {
    devise: string;
    montant: number;
  };
  stock?: {
    quantite: number;
  };
  variantes?: ProduitVariante[];
  images?: string[];
  attributs?: {
    couleurs?: string[] | any[];
    tailles?: string[] | any[];
    marque?: string | any | null;
    typeUnitePrincipal?: string | any | null;
  };
  statut: 'actif' | 'rupture_stock' | 'archive';
  dateCreation?: Date;
  dateMiseAJour?: Date;
}

export interface ProduitFormData {
  idCategorie: string;
  nom: string;
  slug: string;
  description?: string;
  prix: {
    devise: string;
    montant: number;
  };
  stock: {
    quantite: number;
  };
  variantes?: ProduitVariante[];
  images?: string[];
  attributs?: {
    couleurs?: string[];
    tailles?: string[];
    marque?: string;
    typeUnitePrincipal?: string;
  };
  statut?: 'actif' | 'rupture_stock' | 'archive';
}

export interface PaginationResult<T> {
  produits?: T[];
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
export class ProduitService {
  private apiUrl = `${environment.apiUrl}/api/boutique/produits`;
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getProduits(page: number = 1, limit: number = 10): Observable<PaginationResult<Produit>> {
    return this.http.get<PaginationResult<Produit>>(`${this.apiUrl}?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  getProduitsByBoutique(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/boutique`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  getProduitsByCategorie(idCategorie: string): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/categorie/${idCategorie}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  getProduitsByStatut(statut: string): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/statut/${statut}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  getProduitById(id: string): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  getProduitBySlug(slug: string): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/slug/${slug}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  createProduit(produit: ProduitFormData): Observable<Produit> {
    return this.http.post<Produit>(`${this.apiUrl}`, produit, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  updateProduit(id: string, produit: ProduitFormData): Observable<Produit> {
    return this.http.put<Produit>(`${this.apiUrl}/${id}`, produit, {
      headers: this.getAuthHeaders(),
    }).pipe(
      tap(() => this.toastService.showSuccess('Produit mis à jour avec succès')),
      catchError(this.handleError.bind(this)),
    );
  }

  updateStock(id: string, quantite: number): Observable<Produit> {
    return this.http.put<Produit>(`${this.apiUrl}/${id}/stock`, { quantite }, {
      headers: this.getAuthHeaders(),
    }).pipe(
      tap(() => this.toastService.showSuccess('Stock mis à jour avec succès')),
      catchError(this.handleError.bind(this)),
    );
  }

  // Gestion des variantes
  addVariante(id: string, variante: ProduitVariante): Observable<Produit> {
    return this.http.post<Produit>(`${this.apiUrl}/${id}/variantes`, variante, {
      headers: this.getAuthHeaders(),
    }).pipe(
      tap(() => this.toastService.showSuccess('Variante ajoutée avec succès')),
      catchError(this.handleError.bind(this)),
    );
  }

  updateVarianteStock(id: string, couleur: string, taille: string, quantite: number): Observable<Produit> {
    return this.http.put<Produit>(`${this.apiUrl}/${id}/variantes/stock`, {
      couleur,
      taille,
      quantite
    }, {
      headers: this.getAuthHeaders(),
    }).pipe(
      tap(() => this.toastService.showSuccess('Stock variante mis à jour avec succès')),
      catchError(this.handleError.bind(this)),
    );
  }

  removeVariante(id: string, couleur: string, taille: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/variantes/${encodeURIComponent(couleur)}/${encodeURIComponent(taille)}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      tap(() => this.toastService.showSuccess('Variante supprimée avec succès')),
      catchError(this.handleError.bind(this)),
    );
  }

  deleteProduit(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      tap(() => this.toastService.showSuccess('Produit supprimé avec succès')),
      catchError(this.handleError.bind(this)),
    );
  }

  rechercher(terme: string): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/recherche?terme=${terme}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
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
