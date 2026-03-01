import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  // Use public API endpoint that doesn't require authentication
  // backend base path (dev uses localhost:5000)
  private apiUrl = 'http://localhost:5000/api/public/appels-offre';

  constructor(private http: HttpClient) {}

  // Get all open appels d'offre with pagination
  getAllAppelsOuverts(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  // Get appel d'offre by ID
  getAppelOffre(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Submit a response to an appel (public endpoint)
  createReponse(payload: any): Observable<any> {
    // direct backend route; public POST allowed without auth
    return this.http.post<any>('http://localhost:5000/api/reponses-appel-offre', payload);
  }
}
