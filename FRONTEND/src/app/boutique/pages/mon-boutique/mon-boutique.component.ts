import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-mon-boutique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mon-boutique.component.html',
  styleUrls: ['./mon-boutique.component.scss'],
})
export class MonBoutiqueComponent implements OnInit {
  boutique: any = null;
  isLoading = true;
  erreur: string | null = null;

  // Profile form
  profilForm = { nom: '', telephone: '' };
  profilEnCours = false;
  profilSucces: string | null = null;
  profilErreur: string | null = null;

  // Password form
  passwordForm = { ancien_mot_de_passe: '', nouveau_mot_de_passe: '', confirmer_mot_de_passe: '' };
  passwordEnCours = false;
  passwordSucces: string | null = null;
  passwordErreur: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.charger();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
  }

  charger(): void {
    this.http.get<any>(`${environment.apiUrl}/api/boutique/mon-boutique`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.boutique = res.data;
        this.profilForm.nom = res.data?.contact?.nom || '';
        this.profilForm.telephone = res.data?.contact?.telephone || '';
        this.isLoading = false;
      },
      error: (err) => {
        this.erreur = err.error?.message || 'Impossible de charger les informations de la boutique.';
        this.isLoading = false;
      },
    });
  }

  sauvegarderProfil(): void {
    this.profilEnCours = true;
    this.profilSucces = null;
    this.profilErreur = null;

    this.http.put<any>(`${environment.apiUrl}/api/boutique/mon-boutique/profil`, {
      nom: this.profilForm.nom,
      telephone: this.profilForm.telephone,
    }, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.profilEnCours = false;
        this.profilSucces = 'Informations mises à jour avec succès.';
        // Recharger les données affichées
        this.charger();
      },
      error: (err) => {
        this.profilEnCours = false;
        this.profilErreur = err.error?.message || err.error?.erreur || 'Erreur lors de la mise à jour.';
      },
    });
  }

  changerMotDePasse(): void {
    if (this.passwordForm.nouveau_mot_de_passe !== this.passwordForm.confirmer_mot_de_passe) {
      this.passwordErreur = 'La confirmation du mot de passe ne correspond pas.';
      return;
    }

    this.passwordEnCours = true;
    this.passwordSucces = null;
    this.passwordErreur = null;

    this.http.put<any>(`${environment.apiUrl}/auth/changer-mot-de-passe`, {
      ancien_mot_de_passe: this.passwordForm.ancien_mot_de_passe,
      nouveau_mot_de_passe: this.passwordForm.nouveau_mot_de_passe,
      confirmer_mot_de_passe: this.passwordForm.confirmer_mot_de_passe,
    }, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.passwordEnCours = false;
        this.passwordSucces = 'Mot de passe changé. Vous allez être déconnecté…';
        setTimeout(() => this.deconnecter(), 2000);
      },
      error: (err) => {
        this.passwordEnCours = false;
        this.passwordErreur = err.error?.erreur || err.error?.message || 'Erreur lors du changement de mot de passe.';
      },
    });
  }

  private deconnecter(): void {
    this.authService.logout();
    this.router.navigate(['/boutique-login']);
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
