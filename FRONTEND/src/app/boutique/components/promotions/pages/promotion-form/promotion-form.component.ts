import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { PromotionService, Promotion, PromotionFormData } from '../../services/promotion.service';

interface Produit { _id: string; nom: string; }
interface Categorie { _id: string; nom: string; }

@Component({
  selector: 'app-promotion-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './promotion-form.component.html',
  styleUrls: ['./promotion-form.component.scss'],})
export class PromotionFormComponent implements OnInit {
  private promoService = inject(PromotionService);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  editing = false;
  promoId?: string;
  scope: 'boutique' | 'category' | 'product' = 'boutique';
  
  data: PromotionFormData = {
    type: 'pourcentage',
    valeur: 0,
    dateDebut: '',
    dateFin: '',
  };

  produits: Produit[] = [];
  categories: Categorie[] = [];

  ngOnInit(): void {
    this.chargerProduits();
    this.chargerCategories();
    
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Promo form init, ID from route:', id);
    if (id) {
      this.editing = true;
      this.promoId = id;
      this.promoService.getPromotionById(id).subscribe({
        next: (p) => {
          console.log('Promo loaded:', p);
          this.data = {
            idProduit: p.idProduit,
            idCategorie: p.idCategorie,
            type: p.type,
            valeur: p.valeur,
            dateDebut: this.formatDateForInput(p.dateDebut),
            dateFin: this.formatDateForInput(p.dateFin),
            statut: p.statut,
          };
          console.log('Form data after load:', this.data);
          // Déterminer la portée
          if (p.idProduit) this.scope = 'product';
          else if (p.idCategorie) this.scope = 'category';
          else this.scope = 'boutique';
        },
        error: (err) => {
          console.error('Erreur chargement promotion:', err);
        }
      });
    }
  }

  private formatDateForInput(date: any): string {
    if (!date) return '';
    // Si c'est déjà un string au format YYYY-MM-DD, le retourner directement
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
      return date.substring(0, 10);
    }
    // Sinon, parser la date (ISO string avec heure)
    const d = new Date(date);
    if (isNaN(d.getTime())) return ''; // invalide
    
    // Note: getUTCDate() pour éviter les décalages de fuseau horaire
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  chargerProduits(): void {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<{ produits: Produit[] }>(`${environment.apiUrl}/api/boutique/produits`, { headers })
      .subscribe({
        next: (res) => { this.produits = res.produits || []; },
        error: (err) => console.error('Erreur chargement produits:', err)
      });
  }

  chargerCategories(): void {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<{ categories: Categorie[] }>(`${environment.apiUrl}/api/boutique/categories`, { headers })
      .subscribe({
        next: (res) => { this.categories = res.categories || []; },
        error: (err) => console.error('Erreur chargement catégories:', err)
      });
  }

  onScopeChange(): void {
    // Réinitialiser les IDs en fonction de la portée
    if (this.scope === 'boutique') {
      this.data.idProduit = undefined;
      this.data.idCategorie = undefined;
    } else if (this.scope === 'category') {
      this.data.idProduit = undefined;
    } else if (this.scope === 'product') {
      this.data.idCategorie = undefined;
    }
  }

  submit(): void {
    if (this.editing && this.promoId) {
      this.promoService.updatePromotion(this.promoId, this.data).subscribe({ next: () => this.router.navigate(['/boutique/promotions']) });
    } else {
      this.promoService.createPromotion(this.data).subscribe({ next: () => this.router.navigate(['/boutique/promotions']) });
    }
  }

  cancel(): void {
    this.router.navigate(['/boutique/promotions']);
  }
}
