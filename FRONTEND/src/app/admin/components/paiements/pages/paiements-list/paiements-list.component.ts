import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaiementService } from '../../../../../boutique/components/paiements/services/paiement.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-paiements-loyer-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './paiements-list.component.html',
  styleUrls: ['./paiements-list.component.scss'],
})
export class PaiementsLoyerAdminComponent implements OnInit {
  private paiementService: PaiementService = inject(PaiementService);
  private toastService: ToastService = inject(ToastService);

  activeTab: 'boutiques' | 'paiements' = 'boutiques';
  isLoading = false;

  // Boutiques avec statut loyer
  boutiques: any[] = [];
  stats: any = {};
  moisSelectionne = '';

  // Filtres liste paiements
  filtreStatut = '';
  filtreMois = '';
  currentPage = 1;

  // Liste paiements
  paiements: any[] = [];
  pagination: any = {};

  ngOnInit() {
    this.setMoisCourant();
    this.chargerBoutiquesStatut();
  }

  setMoisCourant() {
    const now = new Date();
    this.moisSelectionne = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.filtreMois = this.moisSelectionne;
  }

  chargerBoutiquesStatut() {
    this.isLoading = true;
    this.paiementService.getBoutiquesStatutLoyer(this.moisSelectionne).subscribe({
      next: (res: any) => {
        this.boutiques = res.data.boutiques;
        this.stats = res.data.stats;
        this.isLoading = false;
      },
      error: (_err: any) => {
        this.toastService.showError('Erreur lors du chargement');
        this.isLoading = false;
      },
    });
  }

  chargerPaiements(page = 1) {
    this.isLoading = true;
    const filtres: any = {};
    if (this.filtreStatut) filtres.statut = this.filtreStatut;
    if (this.filtreMois) filtres.mois_loyer = this.filtreMois;

    this.paiementService.getTousPaiements(filtres, page).subscribe({
      next: (res: any) => {
        this.paiements = res.data.paiements;
        this.pagination = res.data;
        this.currentPage = page;
        this.isLoading = false;
      },
      error: (_err: any) => {
        this.toastService.showError('Erreur lors du chargement');
        this.isLoading = false;
      },
    });
  }

  onTabChange(tab: 'boutiques' | 'paiements') {
    this.activeTab = tab;
    if (tab === 'paiements' && this.paiements.length === 0) {
      this.chargerPaiements();
    }
  }

  getMoisLabel(mois: string): string {
    const [year, month] = mois.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'paye': return 'bg-green-100 text-green-800';
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      case 'echoue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'paye': return '✓ Payé';
      case 'en_attente': return '⏳ En attente';
      case 'echoue': return '✗ Échoué';
      default: return '○ Non payé';
    }
  }

  getMoisOptions(): { value: string; label: string }[] {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      options.push({ value, label: this.getMoisLabel(value) });
    }
    return options;
  }
}
