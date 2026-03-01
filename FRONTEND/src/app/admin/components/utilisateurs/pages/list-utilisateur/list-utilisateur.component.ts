import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableComponent } from '../../../../../shared/components/table/table.component';
import { UtilisateurService } from '../../services/utilisateur.service';
import { Utilisateur } from '../../../../../shared/interfaces/centre.interface';

@Component({
  selector: 'app-list-utilisateur',
  standalone: true,
  imports: [CommonModule, TableComponent, FormsModule],
  templateUrl: './list-utilisateur.component.html',
  styleUrls: ['./list-utilisateur.component.scss']
})
export class ListUtilisateurComponent implements OnInit {
  utilisateurs: Utilisateur[] = [];
  filteredUtilisateurs: Utilisateur[] = [];
  columns = [
    { key: 'nom', label: 'Nom' },
    { key: 'prenom', label: 'Prénom' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rôle' },
    { key: 'actif', label: 'Statut' }
  ];

  isLoading = false;

  // Filtres
  filtreNom: string = '';
  filtreEmail: string = '';
  filtreRole: string = '';
  filtreStatut: string = '';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50];

  constructor(private utilisateurService: UtilisateurService) { }

  ngOnInit(): void {
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    this.isLoading = true;
    this.utilisateurService.getUtilisateurs(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        if (response && response.utilisateurs) {
          this.utilisateurs = response.utilisateurs;
          this.totalItems = response.pagination?.total || 0;
          this.totalPages = response.pagination?.pages || 0;
        } else if (Array.isArray(response)) {
          this.utilisateurs = response;
          this.totalItems = response.length;
          this.totalPages = 1;
        }
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onStatusChange(utilisateur: Utilisateur, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newStatus = input.checked;
    this.utilisateurService.updateUtilisateurStatus(utilisateur._id, newStatus).subscribe(() => {
      const index = this.utilisateurs.findIndex(u => u._id === utilisateur._id);
      if (index > -1) {
        this.utilisateurs[index].actif = newStatus;
        this.applyFilters();
      }
    });
  }

  applyFilters(): void {
    this.filteredUtilisateurs = this.utilisateurs.filter(utilisateur => {
      const correspondNom = !this.filtreNom || 
        utilisateur.nom.toLowerCase().includes(this.filtreNom.toLowerCase()) ||
        utilisateur.prenom.toLowerCase().includes(this.filtreNom.toLowerCase());
      
      const correspondEmail = !this.filtreEmail || 
        utilisateur.email.toLowerCase().includes(this.filtreEmail.toLowerCase());
      
      const correspondRole = !this.filtreRole || utilisateur.role === this.filtreRole;
      
      const correspondStatut = !this.filtreStatut || 
        (this.filtreStatut === 'actif' && utilisateur.actif) || 
        (this.filtreStatut === 'inactif' && !utilisateur.actif);

      return correspondNom && correspondEmail && correspondRole && correspondStatut;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filtreNom = '';
    this.filtreEmail = '';
    this.filtreRole = '';
    this.filtreStatut = '';
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUtilisateurs();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadUtilisateurs();
  }

  get pages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
