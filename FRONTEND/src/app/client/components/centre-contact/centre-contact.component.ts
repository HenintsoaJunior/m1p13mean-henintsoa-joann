import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Centre {
  _id: string;
  nom: string;
  slug: string;
  description?: string;
  image_url?: string;
  adresse?: {
    rue?: string;
    ville?: string;
    code_postal?: string;
    pays?: string;
  };
  email_contact?: string;
  telephone_contact?: string;
  horaires_ouverture?: Record<string, string>;
}

@Component({
  selector: 'app-centre-contact',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="contact-page">
      <!-- Header section -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Nos Centres Commerciaux</h1>
          <p class="page-subtitle">Retrouvez-nous près de chez vous</p>
        </div>
      </div>

      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <span>Chargement des centres...</span>
      </div>

      <div class="error-msg" *ngIf="error && !loading">
        <i class="fas fa-exclamation-circle"></i> {{ error }}
      </div>

      <div class="centres-grid" *ngIf="!loading && centres.length > 0">
        <div class="centre-card" *ngFor="let c of centres">
          <!-- Colonne image -->
          <div class="centre-img-col">
            <img
              [src]="
                c.image_url ||
                'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=600&fit=crop'
              "
              [alt]="c.nom"
              class="centre-img"
            />
            <div class="img-badge">
              <i class="fas fa-map-marker-alt"></i>
              {{ c.adresse?.ville || 'Centre commercial' }}
            </div>
          </div>

          <!-- Colonne contenu -->
          <div class="centre-content">
            <div class="centre-header">
              <h2 class="centre-name">{{ c.nom }}</h2>
              <p class="centre-desc" *ngIf="c.description">{{ c.description }}</p>
            </div>

            <div class="centre-details">
              <!-- Infos de contact -->
              <div class="detail-section">
                <h4 class="section-label"><i class="fas fa-info-circle"></i> Informations</h4>
                <div class="detail-list">
                  <div class="detail-item" *ngIf="adresseComplete(c)">
                    <div class="detail-icon"><i class="fas fa-map-marker-alt"></i></div>
                    <span>{{ adresseComplete(c) }}</span>
                  </div>
                  <div class="detail-item" *ngIf="c.telephone_contact">
                    <div class="detail-icon"><i class="fas fa-phone-alt"></i></div>
                    <a [href]="'tel:' + c.telephone_contact">{{ c.telephone_contact }}</a>
                  </div>
                  <div class="detail-item" *ngIf="c.email_contact">
                    <div class="detail-icon"><i class="fas fa-envelope"></i></div>
                    <a [href]="'mailto:' + c.email_contact">{{ c.email_contact }}</a>
                  </div>
                </div>
              </div>

              <!-- Horaires -->
              <div class="detail-section" *ngIf="hasHoraires(c)">
                <h4 class="section-label"><i class="fas fa-clock"></i> Horaires d'ouverture</h4>
                <div class="horaires-grid">
                  <div
                    class="horaire-row"
                    *ngFor="let jour of joursOrdre"
                    [class.today]="isToday(jour)"
                  >
                    <span class="horaire-jour">{{ jourLabel(jour) }}</span>
                    <span class="horaire-sep"></span>
                    <span class="horaire-val">{{ getHoraire(c, jour) }}</span>
                    <span class="today-badge" *ngIf="isToday(jour)">Aujourd'hui</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="centre-actions">
              <a
                *ngIf="c.telephone_contact"
                [href]="'tel:' + c.telephone_contact"
                class="btn-action btn-call"
              >
                <i class="fas fa-phone"></i> Appeler
              </a>
              <a
                *ngIf="c.email_contact"
                [href]="'mailto:' + c.email_contact"
                class="btn-action btn-email"
              >
                <i class="fas fa-envelope"></i> Envoyer un email
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="empty" *ngIf="!loading && !error && centres.length === 0">
        <i class="fas fa-store-slash"></i>
        <p>Aucun centre commercial disponible.</p>
      </div>
    </div>
  `,
  styles: [
    `
      .contact-page {
        padding: 28px 20px 40px;
        max-width: 1100px;
        margin: 0 auto;
      }

      /* Header */
      .page-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 32px;
        padding-bottom: 20px;
        border-bottom: 2px solid #e5e7eb;
      }
      .page-header-icon {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        background: linear-gradient(135deg, #3660a9, #5b84d4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 22px;
        box-shadow: 0 4px 14px rgba(54, 96, 169, 0.3);
        flex-shrink: 0;
      }
      .page-title {
        font-size: 22px;
        font-weight: 800;
        color: #111827;
        margin: 0 0 2px;
      }
      .page-subtitle {
        font-size: 13px;
        color: #9ca3af;
        margin: 0;
      }

      /* Loading */
      .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 80px 20px;
        color: #9ca3af;
      }
      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #e5e7eb;
        border-top-color: #3660a9;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .error-msg {
        text-align: center;
        padding: 60px 20px;
        color: #ef4444;
        font-size: 15px;
      }
      .empty {
        text-align: center;
        padding: 60px 20px;
        color: #9ca3af;
        font-size: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }
      .empty i {
        font-size: 40px;
        color: #d1d5db;
      }

      /* Grid de cartes */
      .centres-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 28px;
      }

      /* Carte */
      .centre-card {
        background: #fff;
        border-radius: 18px;
        overflow: hidden;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07);
        border: 1px solid #e5e7eb;
        display: flex;
        flex-direction: column;
        transition:
          box-shadow 0.25s,
          transform 0.25s;
      }
      .centre-card:hover {
        box-shadow: 0 8px 36px rgba(54, 96, 169, 0.14);
        transform: translateY(-3px);
      }

      /* Image */
      .centre-img-col {
        position: relative;
        height: 200px;
        overflow: hidden;
      }
      .centre-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.4s ease;
      }
      .centre-card:hover .centre-img {
        transform: scale(1.06);
      }
      .img-badge {
        position: absolute;
        bottom: 12px;
        left: 12px;
        background: rgba(0, 0, 0, 0.55);
        backdrop-filter: blur(6px);
        color: #fff;
        font-size: 12px;
        font-weight: 600;
        padding: 5px 12px;
        border-radius: 20px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      /* Contenu */
      .centre-content {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 18px;
        flex: 1;
      }

      .centre-header {
      }
      .centre-name {
        font-size: 17px;
        font-weight: 800;
        color: #111827;
        margin: 0 0 6px;
      }
      .centre-desc {
        font-size: 13px;
        color: #6b7280;
        line-height: 1.6;
        margin: 0;
      }

      /* Sections détail */
      .centre-details {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .detail-section {
      }
      .section-label {
        font-size: 11px;
        font-weight: 700;
        color: #3660a9;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin: 0 0 10px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .detail-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .detail-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 13px;
        color: #374151;
      }
      .detail-icon {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: #eff3fb;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #3660a9;
        font-size: 12px;
        flex-shrink: 0;
      }
      .detail-item a {
        color: #3660a9;
        text-decoration: none;
      }
      .detail-item a:hover {
        text-decoration: underline;
      }

      /* Horaires */
      .horaires-grid {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .horaire-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12.5px;
        padding: 4px 8px;
        border-radius: 8px;
        transition: background 0.15s;
      }
      .horaire-row:hover {
        background: #f9fafb;
      }
      .horaire-row.today {
        background: #eff3fb;
      }
      .horaire-jour {
        font-weight: 700;
        color: #374151;
        min-width: 36px;
      }
      .horaire-row.today .horaire-jour {
        color: #3660a9;
      }
      .horaire-sep {
        flex: 1;
        border-bottom: 1px dashed #e5e7eb;
        margin: 0 4px;
      }
      .horaire-val {
        color: #6b7280;
        white-space: nowrap;
      }
      .horaire-row.today .horaire-val {
        color: #3660a9;
        font-weight: 600;
      }
      .today-badge {
        font-size: 10px;
        font-weight: 700;
        background: #3660a9;
        color: #fff;
        padding: 2px 8px;
        border-radius: 10px;
        white-space: nowrap;
      }

      /* Boutons d'action */
      .centre-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: auto;
        padding-top: 4px;
      }
      .btn-action {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 9px 18px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.2s;
      }
      .btn-call {
        background: #3660a9;
        color: #fff;
      }
      .btn-call:hover {
        background: #2a4f8a;
      }
      .btn-email {
        background: #eff3fb;
        color: #3660a9;
        border: 1px solid #d0ddf5;
      }
      .btn-email:hover {
        background: #dce6f7;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .centres-grid {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 500px) {
        .page-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
        .centre-img-col {
          height: 170px;
        }
      }
    `,
  ],
})
export class CentreContactComponent implements OnInit {
  centres: Centre[] = [];
  loading = true;
  error = '';

  readonly joursOrdre = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/api/public/centres?limit=50`).subscribe({
      next: (res) => {
        this.centres = res?.data?.docs ?? res?.data?.centres ?? res?.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les informations du centre.';
        this.loading = false;
      },
    });
  }

  adresseComplete(c: Centre): string {
    return [c.adresse?.rue, c.adresse?.ville, c.adresse?.code_postal, c.adresse?.pays]
      .filter(Boolean)
      .join(', ');
  }

  hasHoraires(c: Centre): boolean {
    return !!(c.horaires_ouverture && Object.keys(c.horaires_ouverture).length > 0);
  }

  getHoraire(c: Centre, jour: string): string {
    return (c.horaires_ouverture as any)?.[jour] || '—';
  }

  jourLabel(key: string): string {
    const labels: Record<string, string> = {
      lundi: 'Lun',
      mardi: 'Mar',
      mercredi: 'Mer',
      jeudi: 'Jeu',
      vendredi: 'Ven',
      samedi: 'Sam',
      dimanche: 'Dim',
    };
    return labels[key] ?? key;
  }

  isToday(jour: string): boolean {
    const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    return days[new Date().getDay()] === jour;
  }
}
