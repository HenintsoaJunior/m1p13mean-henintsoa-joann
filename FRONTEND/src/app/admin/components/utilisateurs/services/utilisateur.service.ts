import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { Utilisateur } from '../../../../shared/interfaces/centre.interface';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    if (token) {
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }
    return new HttpHeaders();
  }

  // Récupérer la liste des utilisateurs avec pagination
  getUtilisateurs(page: number = 1, limite: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/utilisateurs?page=${page}&limite=${limite}`, { headers: this.getAuthHeaders() });
  }

  // Mettre à jour le statut d'un utilisateur (activer/désactiver)
  updateUtilisateurStatus(id: string, actif: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/utilisateurs/${id}/statut`, { actif }, { headers: this.getAuthHeaders() });
  }

  // Les méthodes ci-dessous sont des placeholders basés sur une API CRUD complète.
  // Elles devront être implémentées côté backend si nécessaire.

  /*
  getUtilisateur(id: string): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/utilisateurs/${id}`, { headers: this.getAuthHeaders() });
  }

  createUtilisateur(utilisateur: Omit<Utilisateur, 'id' | 'cree_le' | 'modifie_le'>): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.apiUrl}/utilisateurs`, utilisateur, { headers: this.getAuthHeaders() });
  }

  updateUtilisateur(id: string, utilisateur: Partial<Utilisateur>): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.apiUrl}/utilisateurs/${id}`, utilisateur, { headers: this.getAuthHeaders() });
  }

  deleteUtilisateur(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/utilisateurs/${id}`, { headers: this.getAuthHeaders() });
  }
  */
}
