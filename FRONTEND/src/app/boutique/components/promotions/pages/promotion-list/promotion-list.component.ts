import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PromotionService, Promotion } from '../../services/promotion.service';
import { ToastService } from '../../../../../services/toast.service';
import { environment } from '../../../../../../environments/environment';

interface Produit { _id: string; nom: string; variantes?: Array<{ _id: string; nom?: string }>; }
interface Categorie { _id: string; nom: string; }

@Component({
  selector: 'app-promotion-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './promotion-list.component.html',
  styleUrls: ['./promotion-list.component.scss'],
})
export class PromotionListComponent implements OnInit {
  private promoService = inject(PromotionService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private http = inject(HttpClient);

  promotions: Promotion[] = [];
  produits: Produit[] = [];
  categories: Categorie[] = [];
  loading = false;
  isDeleting = false;
  currentPage = 1;
  pageSize = 10;
  total = 0;
  filterStatut = '';
  searchTerm = '';
  deleteConfirmId: string | null = null;
  Math = Math;
  selectedPromo: Promotion | null = null; // used for detail modal

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  ngOnInit(): void {
    this.chargerProduitsEtCategories();
    this.load();
  }

  chargerProduitsEtCategories(): void {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.get<{ produits: Produit[] }>(`${environment.apiUrl}/api/boutique/produits`, { headers })
      .subscribe({
        next: (res) => { this.produits = res.produits || []; },
        error: (err) => console.error('Erreur chargement produits:', err)
      });
    
    this.http.get<{ categories: Categorie[] }>(`${environment.apiUrl}/api/boutique/categories`, { headers })
      .subscribe({
        next: (res) => { this.categories = res.categories || []; },
        error: (err) => console.error('Erreur chargement catégories:', err)
      });
  }

  load(): void {
    this.loading = true;
    this.promoService.getPromotions(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        let promos = res.promotions || [];
        // Appliquer les filtres cÃ´tÃ© client
        if (this.filterStatut) {
          promos = promos.filter(p => p.statut === this.filterStatut);
        }
        if (this.searchTerm) {
          promos = promos.filter(p => 
            (p.idProduit && p.idProduit.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
            (p.idCategorie && p.idCategorie.toLowerCase().includes(this.searchTerm.toLowerCase()))
          );
        }
        this.promotions = promos;
        this.total = res.pagination?.total || promos.length;
        this.loading = false;
      },
      error: () => {
        this.toastService.showError('Erreur du chargement des promotions');
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.load();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.load();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.load();
  }

  goToCreate(): void {
    this.router.navigate(['/boutique/promotions/nouveau']);
  }

  goToEdit(id: string): void {
    this.router.navigate([`/boutique/promotions/edit/${id}`]);
  }

  confirmDelete(id: string): void {
    this.deleteConfirmId = id;
  }

  cancelDelete(): void {
    this.deleteConfirmId = null;
  }

  executeDelete(): void {
    if (!this.deleteConfirmId) return;
    const id = this.deleteConfirmId;
    this.isDeleting = true;
    this.promoService.deletePromotion(id).subscribe({
      next: () => {
        this.toastService.showSuccess('Promotion supprimée');
        this.promotions = this.promotions.filter(p => p._id !== id);
        this.deleteConfirmId = null;
        this.isDeleting = false;
      },
      error: () => {
        this.toastService.showError('Erreur lors de la suppression');
        this.isDeleting = false;
      }
    });
  }

  getStatutLabel(statut?: string): string {
    switch (statut) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'archive': return 'Archivée';
      default: return statut || '';
    }
  }

  getPromoTarget(promo: Promotion): string {
    if (promo.idProduit) {
      const produit = this.produits.find(p => p._id === promo.idProduit);
      return produit?.nom || promo.idProduit;
    }
    if (promo.idCategorie) {
      const categorie = this.categories.find(c => c._id === promo.idCategorie);
      return categorie?.nom || promo.idCategorie;
    }
    return 'Toute la boutique';
  }

  getProduitName(id?: string): string {
    if (!id) return '-';
    const produit = this.produits.find(p => p._id === id);
    return produit?.nom || id;
  }

  getVarianteName(prodId: string | undefined, varId: string | undefined): string {
    if (!prodId || !varId) return '-';
    const produit = this.produits.find(p => p._id === prodId);
    const variante = produit?.variantes?.find(v => v._id === varId as any);
    if (!variante) {
      const shortRef = varId ? (varId.length > 8 ? varId.slice(0, 8) + '…' : varId) : '';
      return `${produit?.nom || 'Produit'} — réf. ${shortRef}`;
    }
    // Prefer explicit name
    if ((variante as any).nom) return (variante as any).nom;
    const parts: string[] = [];
    if ((variante as any).couleur) parts.push((variante as any).couleur);
    if ((variante as any).unite) parts.push((variante as any).unite);
    if ((variante as any).prix?.montant != null) parts.push(String((variante as any).prix.montant) + ((variante as any).prix?.devise ? ' ' + (variante as any).prix.devise : ''));
    if (parts.length > 0) return parts.join(' • ');
    const shortRef = varId ? (varId.length > 8 ? varId.slice(0, 8) + '…' : varId) : '';
    return `${produit?.nom || 'Produit'} — réf. ${shortRef}`;
  }

  getCategorieName(id?: string): string {
    if (!id) return '-';
    const cat = this.categories.find(c => c._id === id);
    return cat?.nom || id;
  }

  showDetails(p: Promotion): void {
    this.selectedPromo = p;
  }

  hideDetails(): void {
    this.selectedPromo = null;
  }
  

  getPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    return pages;
  }

  trackByPage(index: number, item: number): number {
    return item;
  }

  trackByPromotion(index: number, item: Promotion): string | undefined {
    return item?._id;
  }
}
