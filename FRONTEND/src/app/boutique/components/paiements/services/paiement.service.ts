import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface PaiementLoyer {
  _id?: string;
  boutique_id?: string;
  emplacement_id?: string;
  stripe_payment_intent_id?: string;
  montant: number;
  mois_loyer: string;
  statut: 'en_attente' | 'paye' | 'echoue';
  date_paiement?: string;
  facture_envoyee?: boolean;
  cree_le?: string;
}

export interface PaymentIntentResponse {
  success: boolean;
  data: {
    clientSecret: string;
    montant: number;
    mois_loyer: string;
    emplacement: { nom: string; code: string };
    paiement_id: string;
  };
}

@Injectable({ providedIn: 'root' })
export class PaiementService {
  private apiUrlBoutique = `${environment.apiUrl}/api/boutique/paiements`;
  private apiUrlAdmin = `${environment.apiUrl}/api/admin/paiements`;
  private http = inject(HttpClient);

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // Boutique : créer un PaymentIntent
  creerIntent(moisLoyer: string): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(
      `${this.apiUrlBoutique}/creer-intent`,
      { mois_loyer: moisLoyer },
      { headers: this.getAuthHeaders() }
    );
  }

  // Boutique : statut du mois courant
  getStatutMoisCourant(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrlBoutique}/mois-courant`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Boutique : historique des paiements
  getHistorique(page = 1, limit = 10): Observable<any> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<any>(this.apiUrlBoutique, {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  // Admin : liste de tous les paiements
  getTousPaiements(filtres: any = {}, page = 1, limit = 20): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (filtres.statut) params = params.set('statut', filtres.statut);
    if (filtres.mois_loyer) params = params.set('mois_loyer', filtres.mois_loyer);
    return this.http.get<any>(this.apiUrlAdmin, {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  // Admin : boutiques avec statut loyer
  getBoutiquesStatutLoyer(moisLoyer?: string): Observable<any> {
    let params = new HttpParams();
    if (moisLoyer) params = params.set('mois_loyer', moisLoyer);
    return this.http.get<any>(`${this.apiUrlAdmin}/boutiques-statut`, {
      headers: this.getAuthHeaders(),
      params,
    });
  }
}
