import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LogEntry {
  id?: number;
  userId: number | string;
  action: string; // CREATE, UPDATE, DELETE
  entity: string; // The entity affected (users, centres, etc.)
  entityId?: number | string; // ID of the entity affected
  oldValue?: any; // Previous values for updates
  newValue?: any; // New values for updates/creates
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  utilisateur?: {
    nom: string;
    email: string;
    role: string;
  }; // Information de l'utilisateur associé
}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private apiUrl = `${environment.apiUrl}/api/admin/logs`;

  constructor(private http: HttpClient) {}

  /**
   * Log an activity to the backend
   */
  logActivity(logData: Omit<LogEntry, 'id' | 'timestamp'>): Observable<any> {
    const logEntry: LogEntry = {
      ...logData,
      timestamp: new Date()
    };
    
    // Send to backend, but handle errors gracefully if backend endpoint doesn't exist yet
    return this.http.post(this.apiUrl, logEntry).pipe(
      catchError(error => {
        console.warn('Backend logging endpoint not available yet. Logging to console:', logEntry);
        // Still return a successful observable to prevent errors in the interceptor
        return of({ success: true, data: logEntry });
      })
    );
  }

  /**
   * Get all logs from the backend
   */
  getLogs(): Observable<LogEntry[]> {
    // Return empty array if backend endpoint doesn't exist yet
    return this.http.get<LogEntry[]>(this.apiUrl).pipe(
      catchError(error => {
        console.warn('Backend logs endpoint not available yet. Returning empty array.');
        return of([]);
      })
    );
  }

  /**
   * Get logs for a specific entity
   */
  getLogsByEntity(entity: string): Observable<LogEntry[]> {
    return this.http.get<LogEntry[]>(`${this.apiUrl}/entity/${entity}`).pipe(
      catchError(error => {
        console.warn(`Backend logs by entity endpoint not available yet. Returning empty array for entity: ${entity}`);
        return of([]);
      })
    );
  }

  /**
   * Get logs by action type
   */
  getLogsByAction(action: string): Observable<LogEntry[]> {
    return this.http.get<LogEntry[]>(`${this.apiUrl}/action/${action}`).pipe(
      catchError(error => {
        console.warn(`Backend logs by action endpoint not available yet. Returning empty array for action: ${action}`);
        return of([]);
      })
    );
  }
}