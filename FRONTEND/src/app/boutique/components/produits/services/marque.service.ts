import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../../services/toast.service';
import { Marque, MarqueFormData } from '../models/boutique.models';

@Injectable({
  providedIn: 'root',
})
export class MarqueService {
  private apiUrl = `${environment.apiUrl}/api/boutique/marques`;
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllMarques(activesSeulement: boolean = true): Observable<{ marques: Marque[] }> {
    return this.http.get<{ marques: Marque[] }>(
      `${this.apiUrl}?activesSeulement=${activesSeulement}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  getMarqueById(id: string): Observable<{ marque: Marque }> {
    return this.http.get<{ marque: Marque }>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  getMarqueBySlug(slug: string): Observable<{ marque: Marque }> {
    return this.http.get<{ marque: Marque }>(`${this.apiUrl}/slug/${slug}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  createMarque(marque: MarqueFormData): Observable<{ marque: Marque }> {
    return this.http.post<{ marque: Marque }>(`${this.apiUrl}`, marque, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  updateMarque(id: string, marque: MarqueFormData): Observable<{ marque: Marque }> {
    return this.http.put<{ marque: Marque }>(`${this.apiUrl}/${id}`, marque, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  deleteMarque(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  rechercherMarques(terme: string): Observable<{ marques: Marque[] }> {
    return this.http.get<{ marques: Marque[] }>(`${this.apiUrl}/recherche?terme=${terme}`, {
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
