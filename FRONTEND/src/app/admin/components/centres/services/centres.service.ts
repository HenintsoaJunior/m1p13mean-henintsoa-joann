import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

export interface Centre {
  _id?: string;
  nom: string;
  slug?: string;
  adresse: {
    rue: string;
    ville: string;
    code_postal: string;
    pays: string;
    coordonnees?: { type: string; coordinates: number[] };
  };
  description?: string;
  horaires_ouverture?: { [key: string]: string };
  email_contact?: string;
  telephone_contact?: string;
  cree_le?: Date;
  modifie_le?: Date;
}

export interface Batiment {
  _id?: string;
  centre_id: string;
  nom: string;
  description?: string;
  nombre_etages: number;
  cree_le?: Date;
  modifie_le?: Date;
}

export interface Etage {
  _id?: string;
  batiment_id?: string;
  nom: string;
  niveau: number;
  surface_totale_m2?: number;
  hauteur_sous_plafond_m?: number;
  cree_le?: Date;
  modifie_le?: Date;
}

export interface Emplacement {
  _id?: string;
  etage_id: string;
  code: string;
  type: 'box' | 'kiosque' | 'zone_loisirs' | 'zone_commune' | 'pop_up' | 'autre';
  nom?: string;
  surface_m2?: number;
  position?: {
    type: 'polygone' | 'point';
    coordonnees: number[][];
  };
  statut: 'libre' | 'occupe' | 'reserve' | 'en_travaux' | 'en_negociation';
  loyer_mensuel?: number;
  cree_le?: Date;
  modifie_le?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CentresService {
  private apiUrl = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    if (token) {
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }
    return new HttpHeaders();
  }

  // Centres CRUD
  getCentres(): Observable<Centre[]> {
    return this.http.get<any>(`${this.apiUrl}/centres`, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => {
          // Si la réponse est un objet avec success et data
          if (response && response.success && response.data) {
            // Si data contient centres (pagination spécifique)
            if (response.data.centres && Array.isArray(response.data.centres)) {
              return response.data.centres;
            }
            // Si data contient des docs (pagination)
            if (response.data.docs && Array.isArray(response.data.docs)) {
              return response.data.docs;
            }
            // Si data est directement un tableau
            if (Array.isArray(response.data)) {
              return response.data;
            }
          }
          // Si la réponse est déjà un tableau
          if (Array.isArray(response)) {
            return response;
          }
          // Sinon retourner un tableau vide
          console.warn('Format de réponse inattendu:', response);
          return [];
        })
      );
  }

  getCentre(id: string): Observable<Centre> {
    return this.http.get<Centre>(`${this.apiUrl}/centres/${id}`, { headers: this.getAuthHeaders() });
  }

  createCentre(centre: Centre): Observable<Centre> {
    return this.http.post<Centre>(`${this.apiUrl}/centres`, centre, { headers: this.getAuthHeaders() });
  }

  updateCentre(id: string, centre: Centre): Observable<Centre> {
    return this.http.put<Centre>(`${this.apiUrl}/centres/${id}`, centre, { headers: this.getAuthHeaders() });
  }

  deleteCentre(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/centres/${id}`, { headers: this.getAuthHeaders() });
  }

  // Bâtiments CRUD
  getBatiments(centreId?: string): Observable<Batiment[]> {
    const url = centreId ? `${this.apiUrl}/batiments?centre_id=${centreId}` : `${this.apiUrl}/batiments`;
    return this.http.get<any>(url, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => {
          if (response && response.success && response.data) {
            if (response.data.batiments && Array.isArray(response.data.batiments)) {
              return response.data.batiments;
            }
            if (response.data.docs && Array.isArray(response.data.docs)) {
              return response.data.docs;
            }
            if (Array.isArray(response.data)) {
              return response.data;
            }
          }
          if (Array.isArray(response)) {
            return response;
          }
          return [];
        })
      );
  }

  getBatiment(id: string): Observable<Batiment> {
    return this.http.get<Batiment>(`${this.apiUrl}/batiments/${id}`, { headers: this.getAuthHeaders() });
  }

  createBatiment(batiment: Batiment): Observable<Batiment> {
    return this.http.post<Batiment>(`${this.apiUrl}/batiments`, batiment, { headers: this.getAuthHeaders() });
  }

  updateBatiment(id: string, batiment: Batiment): Observable<Batiment> {
    return this.http.put<Batiment>(`${this.apiUrl}/batiments/${id}`, batiment, { headers: this.getAuthHeaders() });
  }

  deleteBatiment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/batiments/${id}`, { headers: this.getAuthHeaders() });
  }

  // Étages CRUD
  getEtages(batimentId?: string): Observable<Etage[]> {
    const url = batimentId ? `${this.apiUrl}/etages?batiment_id=${batimentId}` : `${this.apiUrl}/etages`;
    return this.http.get<any>(url, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => {
          if (response && response.success && response.data) {
            if (response.data.etages && Array.isArray(response.data.etages)) {
              return response.data.etages;
            }
            if (response.data.docs && Array.isArray(response.data.docs)) {
              return response.data.docs;
            }
            if (Array.isArray(response.data)) {
              return response.data;
            }
          }
          if (Array.isArray(response)) {
            return response;
          }
          return [];
        })
      );
  }

  getEtage(id: string): Observable<Etage> {
    return this.http.get<Etage>(`${this.apiUrl}/etages/${id}`, { headers: this.getAuthHeaders() });
  }

  createEtage(etage: Etage): Observable<Etage> {
    return this.http.post<Etage>(`${this.apiUrl}/etages`, etage, { headers: this.getAuthHeaders() });
  }

  updateEtage(id: string, etage: Etage): Observable<Etage> {
    return this.http.put<Etage>(`${this.apiUrl}/etages/${id}`, etage, { headers: this.getAuthHeaders() });
  }

  deleteEtage(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/etages/${id}`, { headers: this.getAuthHeaders() });
  }

  // Emplacements CRUD
  getEmplacements(etageId?: string): Observable<Emplacement[]> {
    const url = etageId ? `${this.apiUrl}/emplacements?etage_id=${etageId}` : `${this.apiUrl}/emplacements`;
    return this.http.get<any>(url, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => {
          if (response && response.success && response.data) {
            if (response.data.emplacements && Array.isArray(response.data.emplacements)) {
              return response.data.emplacements;
            }
            if (response.data.docs && Array.isArray(response.data.docs)) {
              return response.data.docs;
            }
            if (Array.isArray(response.data)) {
              return response.data;
            }
          }
          if (Array.isArray(response)) {
            return response;
          }
          return [];
        })
      );
  }

  getEmplacement(id: string): Observable<Emplacement> {
    return this.http.get<Emplacement>(`${this.apiUrl}/emplacements/${id}`, { headers: this.getAuthHeaders() });
  }

  createEmplacement(emplacement: Emplacement): Observable<Emplacement> {
    return this.http.post<Emplacement>(`${this.apiUrl}/emplacements`, emplacement, { headers: this.getAuthHeaders() });
  }

  updateEmplacement(id: string, emplacement: Emplacement): Observable<Emplacement> {
    return this.http.put<Emplacement>(`${this.apiUrl}/emplacements/${id}`, emplacement, { headers: this.getAuthHeaders() });
  }

  deleteEmplacement(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/emplacements/${id}`, { headers: this.getAuthHeaders() });
  }
}