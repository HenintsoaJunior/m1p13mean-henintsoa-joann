import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MouvementStockService, MOTIFS_ENTREE, MOTIFS_SORTIE } from '../../services/mouvement-stock.service';
import { ProduitService } from '../../services/produit.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-stock-mouvements',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './stock-mouvements.component.html',
  styleUrls: ['./stock-mouvements.component.scss'],
})
export class StockMouvementsComponent implements OnInit {
  // Données
  produits: any[] = [];
  mouvements: any[] = [];
  pagination: any = {};
  stats: any[] = [];

  // Formulaire nouveau mouvement
  form = {
    idProduit: '',
    idVariante: '',
    type: 'entree' as 'entree' | 'sortie',
    quantite: 1,
    motif: '',
    note: '',
  };

  // État UI
  isLoading = false;
  isSubmitting = false;
  showModal = false;
  selectedProduit: any = null;
  currentPage = 1;
  pageSize = 15;
  pageSizeOptions = [10, 15, 25, 50];
  filterType = '';
  filterProduit = '';

  motifsEntree = MOTIFS_ENTREE;
  motifsSortie = MOTIFS_SORTIE;

  constructor(
    private mouvementService: MouvementStockService,
    private produitService: ProduitService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.chargerProduits();
    this.chargerMouvements();
    this.chargerStats();
  }

  chargerProduits(): void {
    this.produitService.getProduitsByBoutique().subscribe({
      next: (data) => { this.produits = Array.isArray(data) ? data : (data as any).produits || []; },
      error: () => this.toastService.showError('Erreur lors du chargement des produits'),
    });
  }

  chargerMouvements(): void {
    this.isLoading = true;
    this.mouvementService.getMouvements({
      page: this.currentPage,
      limite: this.pageSize,
      type: this.filterType || undefined,
      idProduit: this.filterProduit || undefined,
    }).subscribe({
      next: (data) => {
        this.mouvements = data.mouvements;
        this.pagination = data.pagination;
        this.isLoading = false;
      },
      error: () => {
        this.toastService.showError('Erreur lors du chargement des mouvements');
        this.isLoading = false;
      },
    });
  }

  chargerStats(): void {
    this.mouvementService.getStats().subscribe({
      next: (data) => { this.stats = data.stats || []; },
      error: () => {},
    });
  }

  onProduitChange(): void {
    this.form.idVariante = '';
    this.selectedProduit = this.produits.find(p => p._id === this.form.idProduit) || null;
    if (this.selectedProduit?.variantes?.length === 1) {
      this.form.idVariante = this.selectedProduit.variantes[0]._id;
    }
  }

  get motifsDisponibles() {
    return this.form.type === 'entree' ? this.motifsEntree : this.motifsSortie;
  }

  get stockVarianteSelectionnee(): number {
    if (!this.selectedProduit || !this.form.idVariante) return 0;
    const v = this.selectedProduit.variantes?.find((v: any) => v._id === this.form.idVariante);
    return v?.stock?.quantite ?? 0;
  }

  get labelVariante(): string {
    if (!this.selectedProduit || !this.form.idVariante) return '';
    const v = this.selectedProduit.variantes?.find((v: any) => v._id === this.form.idVariante);
    if (!v) return '';
    return [v.couleur, v.unite].filter(Boolean).join(' / ') || 'Variante par défaut';
  }

  soumettre(): void {
    if (!this.form.idProduit || !this.form.motif || this.form.quantite < 1) {
      this.toastService.showError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    this.isSubmitting = true;
    this.mouvementService.creerMouvement(this.form).subscribe({
      next: () => {
        this.toastService.showSuccess(
          `${this.form.type === 'entree' ? 'Entrée' : 'Sortie'} de ${this.form.quantite} unité(s) enregistrée`
        );
        this.resetForm();
        this.chargerMouvements();
        this.chargerStats();
        this.chargerProduits();
        this.isSubmitting = false;
      },
      error: (err) => {
        this.toastService.showError(err?.error?.erreur || 'Erreur lors de l\'enregistrement');
        this.isSubmitting = false;
      },
    });
  }

  closeModal(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.form = { idProduit: '', idVariante: '', type: 'entree', quantite: 1, motif: '', note: '' };
    this.selectedProduit = null;
    this.showModal = false;
  }

  appliquerFiltres(): void {
    this.currentPage = 1;
    this.chargerMouvements();
  }

  changerPage(page: number): void {
    this.currentPage = page;
    this.chargerMouvements();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.chargerMouvements();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.chargerMouvements();
  }

  get totalItems(): number { return this.pagination.total || 0; }
  get totalPages(): number { return this.pagination.pages || 1; }

  getStatEntrees(): number {
    return this.stats.find(s => s._id === 'entree')?.totalQuantite ?? 0;
  }

  getStatSorties(): number {
    return this.stats.find(s => s._id === 'sortie')?.totalQuantite ?? 0;
  }

  getNomProduit(mouvement: any): string {
    return mouvement.idProduit?.nom || '—';
  }

  getVarianteLabel(mouvement: any): string {
    if (!mouvement.idProduit?.variantes || !mouvement.idVariante) return '';
    const v = mouvement.idProduit.variantes.find(
      (v: any) => v._id?.toString() === mouvement.idVariante?.toString()
    );
    if (!v) return '';
    return [v.couleur, v.unite].filter(Boolean).join(' / ');
  }

  getMotifLabel(motif: string): string {
    return [...MOTIFS_ENTREE, ...MOTIFS_SORTIE].find(m => m.value === motif)?.label ?? motif;
  }

  get pages(): number[] {
    if (!this.pagination.pages) return [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }
}
