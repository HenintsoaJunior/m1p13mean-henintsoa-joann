import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface AppelOffre {
  _id?: string;
  emplacement_id: string;
  date_appel?: Date;
  description: string;
  statut?: 'ouvert' | 'ferme' | 'attribue';
}

@Injectable({ providedIn: 'root' })
export class AppelsOffresService {
  private apiUrl = `${environment.apiUrl}/api/admin/appels-offre`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    if (token) return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return new HttpHeaders();
  }

  getAllAppels(page = 1, limit = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}?page=${page}&limit=${limit}`, { headers: this.getAuthHeaders() });
  }

  getAppelById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  createAppel(payload: Partial<AppelOffre>): Observable<any> {
    return this.http.post(this.apiUrl, payload, { headers: this.getAuthHeaders() });
  }

  updateAppel(id: string, payload: Partial<AppelOffre>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, payload, { headers: this.getAuthHeaders() });
  }

  deleteAppel(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  getAppelsByEmplacement(emplacementId: string, page = 1, limit = 50): Observable<any> {
    return this.http.get(`${this.apiUrl}/emplacement/${emplacementId}?page=${page}&limit=${limit}`, { headers: this.getAuthHeaders() });
  }

  getAppelsByStatut(statut: string, page = 1, limit = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}/statut/${statut}?page=${page}&limit=${limit}`, { headers: this.getAuthHeaders() });
  }
}
