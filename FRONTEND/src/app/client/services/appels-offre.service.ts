import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AppelOffreDto {
  _id?: string;
  emplacement_id: string;
  emplacement?: {
    _id: string;
    nom: string;
    code: string;
    surface_m2: number;
    loyer_mensuel: number;
  };
  description: string;
  statut: string;
  date_appel: Date;
  date_deadline?: Date;
  cree_le?: Date;
  modifie_le?: Date;
}

export interface AppelsOffreResponse {
  appelsOffre: AppelOffreDto[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AppelsOffreService {
  private apiUrl = `${environment.apiUrl}/api/public/appels-offre`;
  private reponsesUrl = `${environment.apiUrl}/api/reponses-appel-offre`;

  constructor(private http: HttpClient) {}

  getAllAppelsOuverts(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  getAppelOffre(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createReponse(payload: any): Observable<any> {
    return this.http.post<any>(this.reponsesUrl, payload);
  }
}
