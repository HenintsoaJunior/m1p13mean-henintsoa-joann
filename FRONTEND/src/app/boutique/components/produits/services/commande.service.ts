import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface LigneCommande {
  idProduit: string | any;
  idVariante?: string;
  nomProduit?: string;
  couleur?: string;
  unite?: string;
  prixUnitaire: number;
  quantite: number;
  sousTotal?: number;
}

export interface ClientCommande {
  nom: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
}

export interface Commande {
  _id?: string;
  idBoutique?: string;
  reference?: string;
  client: ClientCommande;
  lignes: LigneCommande[];
  statut?: 'en_attente' | 'confirmee' | 'expediee' | 'livree' | 'annulee';
  total?: number;
  notes?: string;
  createdAt?: string;
}

export const STATUTS_COMMANDE = [
  { value: 'en_attente', label: 'En attente' },
  { value: 'confirmee', label: 'Confirmée' },
  { value: 'expediee', label: 'Expédiée' },
  { value: 'livree', label: 'Livrée' },
  { value: 'annulee', label: 'Annulée' },
];

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private apiUrl = `${environment.apiUrl}/api/boutique/commandes`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  creerCommande(data: Partial<Commande>): Observable<any> {
    return this.http.post(this.apiUrl, data, { headers: this.getHeaders() });
  }

  getCommandes(options: { page?: number; limite?: number; statut?: string } = {}): Observable<any> {
    let params = new HttpParams();
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limite) params = params.set('limite', options.limite.toString());
    if (options.statut) params = params.set('statut', options.statut);
    return this.http.get(this.apiUrl, { headers: this.getHeaders(), params });
  }

  getCommande(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  modifierCommande(id: string, data: Partial<Commande>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  modifierStatut(id: string, statut: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/statut`, { statut }, { headers: this.getHeaders() });
  }

  supprimerCommande(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`, { headers: this.getHeaders() });
  }
}
