import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommandeService, STATUTS_COMMANDE, Commande } from '../produits/services/commande.service';
import { ProduitService } from '../produits/services/produit.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-commande-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './commande-list.component.html',
  styleUrls: ['./commande-list.component.scss'],
})
export class CommandeListComponent implements OnInit {
  commandes: any[] = [];
  pagination: any = {};
  stats: any = {};
  produits: any[] = [];
  statuts = STATUTS_COMMANDE;

  // Filtres
  filterStatut = '';
  filterClient = '';
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];

  // État UI
  isLoading = false;
  isSubmitting = false;

  // Modals
  showCreateModal = false;
  showStatutModal = false;
  showDetailModal = false;
  selectedCommande: any = null;
  deleteConfirmId: string | null = null;

  // Formulaire création
  form: any = {
    client: { nom: '', prenom: '', email: '', telephone: '', adresse: '' },
    lignes: [],
    notes: '',
  };

  // Formulaire changement statut
  nouveauStatut = '';

  // Ajout de ligne produit
  nouvelleLigne: any = {
    idProduit: '',
    idVariante: '',
    quantite: 1,
    prixUnitaire: 0,
  };
  selectedProduitLigne: any = null;

  constructor(
    private commandeService: CommandeService,
    private produitService: ProduitService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.chargerCommandes();
    this.chargerStats();
    this.chargerProduits();
  }

  chargerCommandes(): void {
    this.isLoading = true;
    this.commandeService.getCommandes({
      page: this.currentPage,
      limite: this.pageSize,
      statut: this.filterStatut || undefined,
    }).subscribe({
      next: (data) => {
        this.commandes = data.commandes || [];
        this.pagination = data.pagination || {};
        this.isLoading = false;
      },
      error: () => {
        this.toastService.showError('Erreur lors du chargement des commandes');
        this.isLoading = false;
      },
    });
  }

  chargerStats(): void {
    this.commandeService.getStats().subscribe({
      next: (data) => { this.stats = data.stats || {}; },
      error: () => {},
    });
  }

  chargerProduits(): void {
    this.produitService.getProduitsByBoutique().subscribe({
      next: (data: any) => {
        this.produits = Array.isArray(data) ? data : (data.produits || []);
      },
      error: () => {},
    });
  }

  appliquerFiltres(): void {
    this.currentPage = 1;
    this.chargerCommandes();
  }

  effacerFiltres(): void {
    this.filterStatut = '';
    this.filterClient = '';
    this.currentPage = 1;
    this.chargerCommandes();
  }

  get commandesFiltrees(): any[] {
    if (!this.filterClient) return this.commandes;
    const search = this.filterClient.toLowerCase();
    return this.commandes.filter(c =>
      (c.client?.nom || '').toLowerCase().includes(search) ||
      (c.client?.prenom || '').toLowerCase().includes(search)
    );
  }

  // ---- CREATE ----
  ouvrirCreateModal(): void {
    this.form = {
      client: { nom: '', prenom: '', email: '', telephone: '', adresse: '' },
      lignes: [],
      notes: '',
    };
    this.nouvelleLigne = { idProduit: '', idVariante: '', quantite: 1, prixUnitaire: 0 };
    this.selectedProduitLigne = null;
    this.showCreateModal = true;
    this.chargerProduits(); // reload fresh stock data
  }

  fermerCreateModal(): void {
    this.showCreateModal = false;
  }

  onProduitLigneChange(idProduit?: string): void {
    const id = (idProduit ?? this.nouvelleLigne.idProduit)?.toString();
    this.nouvelleLigne.idVariante = '';
    this.nouvelleLigne.prixUnitaire = 0;
    this.selectedProduitLigne = this.produits.find(p => p._id?.toString() === id) || null;
    if (this.selectedProduitLigne?.variantes?.length === 1) {
      this.nouvelleLigne.idVariante = this.selectedProduitLigne.variantes[0]._id?.toString();
      this.nouvelleLigne.prixUnitaire = this.selectedProduitLigne.variantes[0].prix?.montant || 0;
    }
  }

  onVarianteLigneChange(idVariante?: string): void {
    if (!this.selectedProduitLigne) return;
    const id = (idVariante ?? this.nouvelleLigne.idVariante)?.toString();
    if (!id) return;
    const variante = this.selectedProduitLigne.variantes.find(
      (v: any) => v._id?.toString() === id
    );
    if (variante) {
      this.nouvelleLigne.prixUnitaire = variante.prix?.montant || 0;
    }
  }

  get stockLigneActuel(): number {
    if (!this.selectedProduitLigne) return 0;
    const idVariante = this.nouvelleLigne.idVariante?.toString();
    if (idVariante) {
      const v = this.selectedProduitLigne.variantes?.find(
        (v: any) => v._id?.toString() === idVariante
      );
      return v?.stock?.quantite ?? 0;
    }
    if (this.selectedProduitLigne.variantes?.length > 0) {
      return this.selectedProduitLigne.variantes[0]?.stock?.quantite ?? 0;
    }
    return 0;
  }

  get stockInsuffisant(): boolean {
    if (!this.selectedProduitLigne) return false;
    // For multi-variant products, don't check until a variant is selected
    if ((this.selectedProduitLigne.variantes?.length ?? 0) > 1 && !this.nouvelleLigne.idVariante) return false;
    return this.nouvelleLigne.quantite > this.stockLigneActuel;
  }

  ajouterLigne(): void {
    if (!this.nouvelleLigne.idProduit || !this.nouvelleLigne.quantite || this.nouvelleLigne.quantite < 1) {
      this.toastService.showError('Sélectionnez un produit et une quantité valide');
      return;
    }
    const produit = this.produits.find(p => p._id?.toString() === this.nouvelleLigne.idProduit?.toString());
    let variante: any = null;
    if (this.nouvelleLigne.idVariante && produit) {
      variante = produit.variantes.find((v: any) => v._id?.toString() === this.nouvelleLigne.idVariante?.toString());
    } else if (produit?.variantes?.length > 0) {
      variante = produit.variantes[0];
    }
    this.form.lignes.push({
      idProduit: this.nouvelleLigne.idProduit,
      idVariante: variante?._id || '',
      nomProduit: produit?.nom || '',
      couleur: variante?.couleur || '',
      unite: variante?.unite || '',
      prixUnitaire: this.nouvelleLigne.prixUnitaire,
      quantite: this.nouvelleLigne.quantite,
      sousTotal: this.nouvelleLigne.prixUnitaire * this.nouvelleLigne.quantite,
    });
    this.nouvelleLigne = { idProduit: '', idVariante: '', quantite: 1, prixUnitaire: 0 };
    this.selectedProduitLigne = null;
  }

  supprimerLigne(index: number): void {
    this.form.lignes.splice(index, 1);
  }

  get totalForm(): number {
    return this.form.lignes.reduce((sum: number, l: any) => sum + (l.prixUnitaire * l.quantite), 0);
  }

  soumettreCommande(): void {
    if (!this.form.client.nom) {
      this.toastService.showError('Le nom du client est requis');
      return;
    }
    if (this.form.lignes.length === 0) {
      this.toastService.showError('Ajoutez au moins une ligne de produit');
      return;
    }
    this.isSubmitting = true;
    this.commandeService.creerCommande(this.form).subscribe({
      next: () => {
        this.toastService.showSuccess('Commande créée avec succès');
        this.fermerCreateModal();
        this.chargerCommandes();
        this.chargerStats();
        this.isSubmitting = false;
      },
      error: (err) => {
        this.toastService.showError(err?.error?.erreur || 'Erreur lors de la création');
        this.isSubmitting = false;
      },
    });
  }

  // ---- STATUT ----
  ouvrirStatutModal(commande: any): void {
    this.selectedCommande = commande;
    this.nouveauStatut = commande.statut;
    this.showStatutModal = true;
  }

  fermerStatutModal(): void {
    this.showStatutModal = false;
    this.selectedCommande = null;
  }

  sauvegarderStatut(): void {
    if (!this.selectedCommande || !this.nouveauStatut) return;
    this.isSubmitting = true;
    this.commandeService.modifierStatut(this.selectedCommande._id, this.nouveauStatut).subscribe({
      next: () => {
        this.toastService.showSuccess('Statut mis à jour');
        this.fermerStatutModal();
        this.chargerCommandes();
        this.chargerStats();
        this.isSubmitting = false;
      },
      error: (err) => {
        this.toastService.showError(err?.error?.erreur || 'Erreur lors de la mise à jour');
        this.isSubmitting = false;
      },
    });
  }

  // ---- DETAIL ----
  voirDetail(commande: any): void {
    this.selectedCommande = commande;
    this.showDetailModal = true;
  }

  fermerDetailModal(): void {
    this.showDetailModal = false;
    this.selectedCommande = null;
  }

  // ---- DELETE ----
  demanderSuppression(id: string): void {
    this.deleteConfirmId = id;
  }

  annulerSuppression(): void {
    this.deleteConfirmId = null;
  }

  confirmerSuppression(id: string): void {
    this.commandeService.supprimerCommande(id).subscribe({
      next: () => {
        this.toastService.showSuccess('Commande supprimée');
        this.deleteConfirmId = null;
        this.chargerCommandes();
        this.chargerStats();
      },
      error: (err) => {
        this.toastService.showError(err?.error?.erreur || 'Erreur lors de la suppression');
        this.deleteConfirmId = null;
      },
    });
  }

  // ---- PAGINATION ----
  get totalItems(): number { return this.pagination?.total || 0; }
  get totalPages(): number {
    return this.pagination?.pages || 1;
  }

  get pages(): number[] {
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    const range: number[] = [];
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.chargerCommandes();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.chargerCommandes();
  }

  // ---- HELPERS ----
  getStatutLabel(statut: string): string {
    return this.statuts.find(s => s.value === statut)?.label || statut;
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatMontant(montant: number): string {
    return (montant || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' Ar';
  }

  getProduitsResume(commande: any): string {
    if (!commande.lignes?.length) return '-';
    return commande.lignes.map((l: any) => `${l.nomProduit} x${l.quantite}`).join(', ');
  }

  canDelete(commande: any): boolean {
    return ['en_attente', 'annulee'].includes(commande.statut);
  }
}
