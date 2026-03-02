import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BoutiqueAdminService {
  private apiUrl = `${environment.apiUrl}/api/admin/boutiques`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
  }

  getBoutiques(page: number = 1, limit: number = 10, statut?: string): Observable<any> {
    let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
    if (statut) url += `&statut=${statut}`;
    return this.http.get<any>(url, { headers: this.getAuthHeaders() });
  }

  updateStatut(id: string, statut: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, { statut }, { headers: this.getAuthHeaders() });
  }

  desactiverBoutique(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/desactiver`, {}, { headers: this.getAuthHeaders() });
  }
}
