import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../../services/toast.service';
import { TypeUnite, TypeUniteFormData } from '../models/boutique.models';

@Injectable({
  providedIn: 'root',
})
export class TypeUniteService {
  private apiUrl = `${environment.apiUrl}/api/boutique/types-unites`;
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllTypesUnites(actifsSeulement: boolean = true): Observable<{ typesUnites: TypeUnite[] }> {
    return this.http.get<{ typesUnites: TypeUnite[] }>(
      `${this.apiUrl}?actifsSeulement=${actifsSeulement}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  getTypeUniteById(id: string): Observable<{ typeUnite: TypeUnite }> {
    return this.http.get<{ typeUnite: TypeUnite }>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  createTypeUnite(typeUnite: TypeUniteFormData): Observable<{ typeUnite: TypeUnite }> {
    return this.http.post<{ typeUnite: TypeUnite }>(`${this.apiUrl}`, typeUnite, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  updateTypeUnite(id: string, typeUnite: TypeUniteFormData): Observable<{ typeUnite: TypeUnite }> {
    return this.http.put<{ typeUnite: TypeUnite }>(`${this.apiUrl}/${id}`, typeUnite, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  deleteTypeUnite(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  ajouterValeur(id: string, valeur: string): Observable<{ typeUnite: TypeUnite }> {
    return this.http.post<{ typeUnite: TypeUnite }>(`${this.apiUrl}/${id}/valeurs`, { valeur }, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  supprimerValeur(id: string, valeur: string): Observable<{ typeUnite: TypeUnite }> {
    return this.http.delete<{ typeUnite: TypeUnite }>(`${this.apiUrl}/${id}/valeurs/${encodeURIComponent(valeur)}`, {
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
