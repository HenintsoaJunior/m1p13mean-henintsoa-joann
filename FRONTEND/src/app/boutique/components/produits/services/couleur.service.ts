import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../../services/toast.service';
import { Couleur, CouleurFormData } from '../models/boutique.models';

@Injectable({
  providedIn: 'root',
})
export class CouleurService {
  private apiUrl = `${environment.apiUrl}/api/boutique/couleurs`;
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllCouleurs(activesSeulement: boolean = true, categorie?: string): Observable<{ couleurs: Couleur[] }> {
    let url = `${this.apiUrl}?activesSeulement=${activesSeulement}`;
    if (categorie) {
      url += `&categorie=${categorie}`;
    }
    return this.http.get<{ couleurs: Couleur[] }>(url, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  getCouleurById(id: string): Observable<{ couleur: Couleur }> {
    return this.http.get<{ couleur: Couleur }>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  createCouleur(couleur: CouleurFormData): Observable<{ couleur: Couleur }> {
    return this.http.post<{ couleur: Couleur }>(`${this.apiUrl}`, couleur, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  updateCouleur(id: string, couleur: CouleurFormData): Observable<{ couleur: Couleur }> {
    return this.http.put<{ couleur: Couleur }>(`${this.apiUrl}/${id}`, couleur, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  deleteCouleur(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  rechercherCouleurs(terme: string): Observable<{ couleurs: Couleur[] }> {
    return this.http.get<{ couleurs: Couleur[] }>(`${this.apiUrl}/recherche?terme=${terme}`, {
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
