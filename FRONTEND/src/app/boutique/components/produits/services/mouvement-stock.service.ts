import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface MouvementStock {
  _id?: string;
  idBoutique?: string;
  idProduit: string | any;
  idVariante?: string;
  type: 'entree' | 'sortie';
  quantite: number;
  motif: string;
  note?: string;
  stockAvant: number;
  stockApres: number;
  utilisateur?: any;
  dateCreation?: string;
}

export const MOTIFS_ENTREE = [
  { value: 'achat_fournisseur', label: 'Achat fournisseur' },
  { value: 'retour_client', label: 'Retour client' },
  { value: 'ajustement_inventaire', label: 'Ajustement inventaire' },
  { value: 'transfert', label: 'Transfert' },
  { value: 'autre', label: 'Autre' },
];

export const MOTIFS_SORTIE = [
  { value: 'vente', label: 'Vente' },
  { value: 'perte', label: 'Perte / Casse' },
  { value: 'ajustement_inventaire', label: 'Ajustement inventaire' },
  { value: 'transfert', label: 'Transfert' },
  { value: 'autre', label: 'Autre' },
];

@Injectable({ providedIn: 'root' })
export class MouvementStockService {
  private apiUrl = `${environment.apiUrl}/api/boutique/mouvements-stock`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  creerMouvement(data: Partial<MouvementStock>): Observable<any> {
    return this.http.post(this.apiUrl, data, { headers: this.getHeaders() });
  }

  getMouvements(options: { page?: number; limite?: number; idProduit?: string; type?: string } = {}): Observable<any> {
    let params = new HttpParams();
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limite) params = params.set('limite', options.limite.toString());
    if (options.idProduit) params = params.set('idProduit', options.idProduit);
    if (options.type) params = params.set('type', options.type);
    return this.http.get(this.apiUrl, { headers: this.getHeaders(), params });
  }

  getMouvementsParProduit(idProduit: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/produit/${idProduit}`, { headers: this.getHeaders() });
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`, { headers: this.getHeaders() });
  }
}
