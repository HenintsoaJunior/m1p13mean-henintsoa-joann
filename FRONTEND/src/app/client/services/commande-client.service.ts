import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LigneCommande {
  idProduit: string;
  idVariante?: string;
  quantite: number;
  prixUnitaire: number;
}

@Injectable({ providedIn: 'root' })
export class CommandeClientService {
  private base = `${environment.apiUrl}/api/client`;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  passerCommande(lignes: LigneCommande[], adresse: string, notes?: string): Observable<any> {
    return this.http.post(`${this.base}/commandes`, { lignes, adresse, notes }, { headers: this.headers() });
  }

  mesCommandes(): Observable<any> {
    return this.http.get(`${this.base}/commandes`, { headers: this.headers() });
  }
}
