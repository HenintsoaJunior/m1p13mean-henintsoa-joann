import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../../services/toast.service';
import { Taille, TailleFormData } from '../models/boutique.models';

@Injectable({
  providedIn: 'root',
})
export class TailleService {
  private apiUrl = `${environment.apiUrl}/api/boutique/tailles`;
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllTailles(activesSeulement: boolean = true): Observable<{ tailles: Taille[] }> {
    return this.http.get<{ tailles: Taille[] }>(
      `${this.apiUrl}?activesSeulement=${activesSeulement}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  getTaillesStandards(): Observable<{ tailles: Taille[] }> {
    return this.http.get<{ tailles: Taille[] }>(`${this.apiUrl}/standards`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  getTaillesParTypeUnite(idTypeUnite: string): Observable<{ tailles: Taille[] }> {
    return this.http.get<{ tailles: Taille[] }>(`${this.apiUrl}/type/${idTypeUnite}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  getTailleById(id: string): Observable<{ taille: Taille }> {
    return this.http.get<{ taille: Taille }>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  createTaille(taille: TailleFormData): Observable<{ taille: Taille }> {
    return this.http.post<{ taille: Taille }>(`${this.apiUrl}`, taille, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  updateTaille(id: string, taille: TailleFormData): Observable<{ taille: Taille }> {
    return this.http.put<{ taille: Taille }>(`${this.apiUrl}/${id}`, taille, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  deleteTaille(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(this.handleError.bind(this)),
    );
  }

  rechercherTailles(terme: string, idTypeUnite?: string): Observable<{ tailles: Taille[] }> {
    let url = `${this.apiUrl}/recherche?terme=${terme}`;
    if (idTypeUnite) {
      url += `&idTypeUnite=${idTypeUnite}`;
    }
    return this.http.get<{ tailles: Taille[] }>(url, {
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
