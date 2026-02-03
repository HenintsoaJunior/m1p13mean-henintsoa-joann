import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Centre } from '../interfaces/centre.interface';

@Injectable({
  providedIn: 'root'
})
export class CentreService {
  private readonly apiUrl = 'http://localhost:5000/api/public/centres';

  constructor(private http: HttpClient) {}

  getCentreWithPlan(centreId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${centreId}/plan`);
  }

  getAllCentres(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getCentreById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}