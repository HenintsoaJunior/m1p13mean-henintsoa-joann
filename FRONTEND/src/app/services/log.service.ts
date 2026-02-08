import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LogEntry {
  id?: number;
  utilisateurId: number | string;
  action: string; // CREATE, UPDATE, DELETE
  entite: string; // L'entité concernée (utilisateurs, centres, etc.)
  entiteId?: number | string; // ID de l'entité concernée
  ancienneValeur?: any; // Valeurs précédentes (pour les modifications/suppressions)
  nouvelleValeur?: any; // Nouvelles valeurs (pour les créations/modifications)
  dateHeure: Date;
  adresseIp?: string;
  navigateur?: string;
  utilisateur?: {
    nom: string;
    email: string;
    role: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private apiUrl = `${environment.apiUrl}/api/admin/logs`;

  constructor(private http: HttpClient) {}

  /**
   * Enregistrer une activité dans le backend
   */
  logActivity(logData: Omit<LogEntry, 'id' | 'dateHeure'>): Observable<any> {
    const logEntry: LogEntry = {
      ...logData,
      dateHeure: new Date()
    };

    // Check if user is admin before attempting to send logs to admin endpoint
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role || 'user';
        
        // Only send logs to backend if user is admin
        if (role === 'admin') {
          return this.http.post(this.apiUrl, logEntry).pipe(
            catchError(error => {
              console.warn('Endpoint de logging non disponible. Log console:', logEntry);
              return of({ success: true, data: logEntry });
            })
          );
        } else {
          // For non-admin users, just log to console
          console.debug('Log activity (non-admin):', logEntry);
          return of({ success: true, data: logEntry });
        }
      } catch (e) {
        console.warn('Impossible de décoder le token pour vérifier le rôle:', e);
        // If we can't decode the token, still attempt to send the log
        return this.http.post(this.apiUrl, logEntry).pipe(
          catchError(error => {
            console.warn('Endpoint de logging non disponible. Log console:', logEntry);
            return of({ success: true, data: logEntry });
          })
        );
      }
    } else {
      // If no token, just log to console
      console.debug('Log activity (no token):', logEntry);
      return of({ success: true, data: logEntry });
    }
  }

  /**
   * Récupérer tous les logs avec pagination
   */
  getLogs(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&limit=${limit}`).pipe(
      catchError(error => {
        console.warn('Endpoint de logs non disponible.');
        return of({ success: true, data: [], total: 0, page: 1, pages: 0 });
      })
    );
  }

  /**
   * Récupérer les logs par entité
   */
  getLogsByEntity(entite: string): Observable<LogEntry[]> {
    return this.http.get<LogEntry[]>(`${this.apiUrl}/entity/${entite}`).pipe(
      catchError(error => {
        console.warn(`Endpoint de logs par entité non disponible pour: ${entite}`);
        return of([]);
      })
    );
  }

  /**
   * Récupérer les logs par action
   */
  getLogsByAction(action: string): Observable<LogEntry[]> {
    return this.http.get<LogEntry[]>(`${this.apiUrl}/action/${action}`).pipe(
      catchError(error => {
        console.warn(`Endpoint de logs par action non disponible pour: ${action}`);
        return of([]);
      })
    );
  }
}