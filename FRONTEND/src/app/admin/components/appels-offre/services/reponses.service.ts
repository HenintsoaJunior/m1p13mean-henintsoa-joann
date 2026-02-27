import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface ReponseDto {
  _id?: string;
  appel_offre_id: string;
  boutique_id?: string;
  montant_propose?: number;
  message?: string;
  statut?: string;
  cree_le?: Date;
}

@Injectable({ providedIn: 'root' })
export class ReponsesService {
  private apiUrl = `${environment.apiUrl}/api/reponses-appel-offre`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    if (token) return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return new HttpHeaders();
  }

  createReponse(payload: Partial<ReponseDto>): Observable<any> {
    return this.http.post(this.apiUrl, payload, { headers: this.getAuthHeaders() });
  }

  getReponsesByAppel(appelId: string, page = 1, limit = 50): Observable<any> {
    return this.http.get(`${this.apiUrl}/appel/${appelId}?page=${page}&limit=${limit}`, { headers: this.getAuthHeaders() });
  }

  acceptReponse(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/accept`, {}, { headers: this.getAuthHeaders() });
  }

  refuseReponse(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/refuse`, {}, { headers: this.getAuthHeaders() });
  }
}
