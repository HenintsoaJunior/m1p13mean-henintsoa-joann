import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoutiqueAdminService } from '../../services/boutique-admin.service';

@Component({
  selector: 'app-list-boutiques',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list-boutiques.component.html',
  styleUrls: ['./list-boutiques.component.scss'],
})
export class ListBoutiquesComponent implements OnInit {
  boutiques: any[] = [];

  // Filtres
  filtreNom: string = '';
  filtreStatut: string = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  pageSizeOptions = [5, 10, 25, 50];

  isLoading = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  constructor(private boutiqueService: BoutiqueAdminService) {}

  ngOnInit(): void {
    this.loadBoutiques();
  }

  loadBoutiques(): void {
    this.isLoading = true;
    this.boutiqueService.getBoutiques(this.currentPage, this.pageSize, this.filtreStatut || undefined).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        const data = response?.data || response;
        this.boutiques = data?.boutiques || [];
        this.totalItems = data?.total || 0;
        this.totalPages = data?.pages || 1;
      },
      error: () => {
        this.isLoading = false;
        this.boutiques = [];
      },
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadBoutiques();
  }

  clearFilters(): void {
    this.filtreNom = '';
    this.filtreStatut = '';
    this.currentPage = 1;
    this.loadBoutiques();
  }

  get filteredBoutiques(): any[] {
    if (!this.filtreNom) return this.boutiques;
    const search = this.filtreNom.toLowerCase();
    return this.boutiques.filter(b =>
      (b.contact?.nom || '').toLowerCase().includes(search) ||
      (b.contact?.prenom || '').toLowerCase().includes(search) ||
      (b.contact?.email || '').toLowerCase().includes(search)
    );
  }

  onStatusChange(boutique: any, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newStatut = input.checked ? 'active' : 'fermee';
    this.boutiqueService.updateStatut(boutique._id, newStatut).subscribe({
      next: (res: any) => {
        boutique.statut = newStatut;
        this.notify(`Boutique ${newStatut === 'active' ? 'activée' : 'désactivée'} avec succès`, 'success');
      },
      error: () => {
        // Revert the checkbox
        input.checked = !input.checked;
        this.notify('Erreur lors de la mise à jour', 'error');
      },
    });
  }

  notify(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }

  // Pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadBoutiques();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadBoutiques();
  }

  get pages(): number[] {
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    const result: number[] = [];
    for (let i = start; i <= end; i++) result.push(i);
    return result;
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      active: 'Active',
      en_attente: 'En attente',
      fermee: 'Fermée',
    };
    return labels[statut] || statut;
  }
}
