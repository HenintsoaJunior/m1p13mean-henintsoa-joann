import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../../services/toast.service';

export interface Promotion {
  _id?: string;
  idBoutique?: string;
  idProduit?: string;
  idVariante?: string; // for targeting specific variant
  idCategorie?: string;
  type: 'pourcentage' | 'montant';
  valeur: number;
  dateDebut: string;
  dateFin: string;
  statut?: 'active' | 'inactive' | 'archive';
  dateCreation?: Date;
  dateMiseAJour?: Date;
}

export interface PromotionFormData {
  idProduit?: string;
  idVariante?: string;
  idCategorie?: string;
  type: 'pourcentage' | 'montant';
  valeur: number;
  dateDebut: string;
  dateFin: string;
  statut?: 'active' | 'inactive' | 'archive';
}

@Injectable({ providedIn: 'root' })
export class PromotionService {
  private apiUrl = `${environment.apiUrl}/api/boutique/promotions`;
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getPromotions(page: number = 1, limit: number = 10): Observable<{ promotions: Promotion[]; pagination: any }> {
    return this.http.get<{ promotions: Promotion[]; pagination: any }>(`${this.apiUrl}?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  getPromotionsByBoutique(): Observable<Promotion[]> {
    return this.http.get<{ promotions: Promotion[] }>(`${this.apiUrl}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      map(res => res.promotions),
      catchError(this.handleError.bind(this)),
    );
  }

  getPromotionById(id: string): Observable<Promotion> {
    return this.http.get<{ promotion: Promotion }>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      map(res => res.promotion),
      catchError(this.handleError.bind(this)),
    );
  }

  createPromotion(promo: PromotionFormData): Observable<Promotion> {
    return this.http.post<{ promotion: Promotion }>(`${this.apiUrl}`, promo, {
      headers: this.getAuthHeaders(),
    }).pipe(
      map(res => res.promotion),
      tap(() => this.toastService.showSuccess('Promotion créée')),
      catchError(this.handleError.bind(this)),
    );
  }

  updatePromotion(id: string, promo: PromotionFormData): Observable<Promotion> {
    return this.http.put<{ promotion: Promotion }>(`${this.apiUrl}/${id}`, promo, {
      headers: this.getAuthHeaders(),
    }).pipe(
      map(res => res.promotion),
      tap(() => this.toastService.showSuccess('Promotion mise à jour')),
      catchError(this.handleError.bind(this)),
    );
  }

  deletePromotion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      tap(() => this.toastService.showSuccess('Promotion supprimée')),
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
