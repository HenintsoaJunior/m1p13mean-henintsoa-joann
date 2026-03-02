import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProduitClient {
  _id: string;
  nom: string;
  slug: string;
  description?: string;
  images?: string[];
  variantes?: Array<{
    _id?: string;
    couleur?: string;
    couleurHex?: string;
    unite?: string;
    prix: { devise: string; montant: number };
    stock: { quantite: number };
  }>;
  idCategorie?: { _id: string; nom: string; slug: string };
  idBoutique?: { contact: { nom: string } };
  statut: string;
  promotion?: {
    _id?: string;
    type: 'pourcentage' | 'montant';
    valeur: number;
    dateDebut: string;
    dateFin: string;
    statut: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ProduitClientService {
  constructor(private http: HttpClient) {}

  getProduits(params: { categorie?: string; q?: string; page?: number; limit?: number; promo?: boolean } = {}): Observable<any> {
    const query = new URLSearchParams();
    if (params.categorie) query.set('categorie', params.categorie);
    if (params.q) query.set('q', params.q);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.promo) query.set('promo', 'true');
    const qs = query.toString();
    return this.http.get<any>(`${environment.apiUrl}/api/public/produits${qs ? '?' + qs : ''}`);
  }
}
