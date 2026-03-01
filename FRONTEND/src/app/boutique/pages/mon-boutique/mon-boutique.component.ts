import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-mon-boutique',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mon-boutique.component.html',
  styleUrls: ['./mon-boutique.component.scss'],
})
export class MonBoutiqueComponent implements OnInit {
  boutique: any = null;
  isLoading = true;
  erreur: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    const token = localStorage.getItem('auth_token');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();

    this.http.get<any>(`${environment.apiUrl}/api/boutique/mon-boutique`, { headers }).subscribe({
      next: (res) => {
        this.boutique = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        this.erreur = err.error?.message || 'Impossible de charger les informations de la boutique.';
        this.isLoading = false;
      },
    });
  }

  get appelOffre(): any { return this.boutique?.appel_offre_id; }
  get emplacement(): any { return this.appelOffre?.emplacement_id; }
  get etage(): any { return this.emplacement?.etage_id; }
  get batiment(): any { return this.etage?.batiment_id; }
  get centre(): any { return this.batiment?.centre_id; }

  get hasPolygon(): boolean {
    return this.emplacement?.position?.type === 'polygone' &&
      Array.isArray(this.emplacement?.position?.coordonnees) &&
      this.emplacement.position.coordonnees.length >= 3;
  }

  get polygonSvgPoints(): string {
    if (!this.hasPolygon) return '';
    return this.emplacement.position.coordonnees
      .map((p: number[]) => `${p[0]},${p[1]}`).join(' ');
  }

  get polygonViewBox(): string {
    if (!this.hasPolygon) return '0 0 200 150';
    const coords: number[][] = this.emplacement.position.coordonnees;
    const xs = coords.map((p: number[]) => p[0]);
    const ys = coords.map((p: number[]) => p[1]);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    const pad = Math.max(20, (maxX - minX) * 0.2);
    return `${minX - pad} ${minY - pad} ${(maxX - minX) + pad * 2} ${(maxY - minY) + pad * 2}`;
  }

  get polygonCenterX(): number {
    if (!this.hasPolygon) return 0;
    const coords: number[][] = this.emplacement.position.coordonnees;
    return coords.reduce((s: number, p: number[]) => s + p[0], 0) / coords.length;
  }

  get polygonCenterY(): number {
    if (!this.hasPolygon) return 0;
    const coords: number[][] = this.emplacement.position.coordonnees;
    return coords.reduce((s: number, p: number[]) => s + p[1], 0) / coords.length;
  }

  get statutLabel(): string {
    const m: Record<string, string> = { active: 'Active', en_attente: 'En attente', fermee: 'Fermée' };
    return m[this.boutique?.statut] || this.boutique?.statut || '-';
  }

  get typeEmplacementLabel(): string {
    const m: Record<string, string> = {
      box: 'Box', kiosque: 'Kiosque', zone_loisirs: 'Zone loisirs',
      zone_commune: 'Zone commune', pop_up: 'Pop-up', autre: 'Autre',
    };
    return m[this.emplacement?.type] || this.emplacement?.type || '-';
  }
}
