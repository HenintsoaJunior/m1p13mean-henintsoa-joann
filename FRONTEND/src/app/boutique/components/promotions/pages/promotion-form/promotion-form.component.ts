import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { PromotionService, Promotion, PromotionFormData } from '../../services/promotion.service';

interface Produit { _id: string; nom: string; variantes?: Array<{ _id: string; nom?: string }>; }
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
  scope: 'category' | 'product' = 'product';
  
  data: PromotionFormData = {
    type: 'pourcentage',
    valeur: 0,
    dateDebut: '',
    dateFin: '',
  };

  produits: Produit[] = [];
  categories: Categorie[] = [];
  variantes: { _id: string; nom?: string }[] = [];

  getVarianteLabel(v: { _id: string; nom?: string; couleur?: string; unite?: string; prix?: { montant?: number; devise?: string } } | null): string {
    if (!v) return '-';
    // Prefer an explicit name
    if (v.nom) return v.nom;
    // Build a human-friendly label from attributes
    const parts: string[] = [];
    if (v.couleur) parts.push(v.couleur);
    if (v.unite) parts.push(v.unite);
    if (v.prix?.montant != null) parts.push((v.prix.montant).toString() + (v.prix.devise ? ' ' + v.prix.devise : ''));
    if (parts.length > 0) return parts.join(' • ');

    // fallback: product name + short ref
    const produit = this.produits.find(p => p._id === this.data.idProduit);
    const prodName = produit?.nom || 'Variante';
    const shortRef = v._id ? (v._id.length > 8 ? v._id.slice(0, 8) + '…' : v._id) : '';
    return `${prodName} — réf. ${shortRef}`;
  }

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
            idVariante: (p as any).idVariante,
            idCategorie: p.idCategorie,
            type: p.type,
            valeur: p.valeur,
            dateDebut: this.formatDateForInput(p.dateDebut),
            dateFin: this.formatDateForInput(p.dateFin),
            statut: p.statut,
          } as PromotionFormData;
          console.log('Form data after load:', this.data);
          // Déterminer la portée
          if (p.idProduit) {
            this.scope = 'product';
            this.onProductChange();
          } else if (p.idCategorie) {
            this.scope = 'category';
          } else {
            // aucune cible précisée -> par défaut sur produit
            this.scope = 'product';
          }
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
        next: (res) => {
          this.produits = res.produits || [];
          console.log('Produits loaded for promo form:', this.produits);
          if (this.scope === 'product' && this.data.idProduit) {
            this.onProductChange();
          }
        },
        error: (err) => console.error('Erreur chargement produits:', err)
      });
  }

  chargerCategories(): void {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<{ categories: Categorie[] }>(`${environment.apiUrl}/api/boutique/categories`, { headers })
      .subscribe({
        next: (res) => { this.categories = res.categories || []; console.log('Categories loaded for promo form:', this.categories); },
        error: (err) => console.error('Erreur chargement catégories:', err)
      });
  }

  onScopeChange(): void {
    // Réinitialiser les IDs en fonction de la portée
    if (this.scope === 'category') {
      this.data.idProduit = undefined;
      this.variantes = [];
      this.data.idVariante = undefined;
    } else if (this.scope === 'product') {
      this.data.idCategorie = undefined;
      this.onProductChange();
    }
  }

  submit(): void {
    if (this.editing && this.promoId) {
      this.promoService.updatePromotion(this.promoId, this.data).subscribe({ next: () => this.router.navigate(['/boutique/promotions']) });
    } else {
      this.promoService.createPromotion(this.data).subscribe({ next: () => this.router.navigate(['/boutique/promotions']) });
    }
  }

  onProductChange(): void {
    // load variants for selected product
    this.variantes = [];
    if (this.data.idProduit) {
      const token = localStorage.getItem('auth_token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.get<any>(`${environment.apiUrl}/api/boutique/produits/${this.data.idProduit}`, { headers })
        .subscribe({
          next: res => {
            this.variantes = res.produit?.variantes || [];
            // if editing and promo includes variante, ensure it exists
            if (this.data.idVariante) {
              const exists = this.variantes.some(v => v._id === this.data.idVariante);
              if (!exists) this.data.idVariante = undefined;
            }
          },
          error: err => console.error('Erreur chargement variantes:', err)
        });
    } else {
      this.data.idVariante = undefined;
    }
  }

  cancel(): void {
    this.router.navigate(['/boutique/promotions']);
  }
}
