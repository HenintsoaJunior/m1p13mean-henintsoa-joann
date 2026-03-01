import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogService, LogEntry } from '../../../services/log.service';

@Component({
  selector: 'app-activity-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activity-history.component.html',
  styleUrls: ['./activity-history.component.scss']
})
export class ActivityHistoryComponent implements OnInit {
  logs: LogEntry[] = [];
  filteredLogs: LogEntry[] = [];

  isLoading = false;

  // Filtres
  filtreEntity: string = '';
  filtreAction: string = '';
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50];
  
  // Variables pour le modal
  showDetailsModal: boolean = false;
  selectedLog: LogEntry | null = null;

  constructor(private logService: LogService) { }

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading = true;
    this.logService.getLogs(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        let logsData: LogEntry[] = [];
        
        if (Array.isArray(response)) {
          logsData = response;
          this.totalItems = response.length;
          this.totalPages = 1;
        } else if (response && response.data && Array.isArray(response.data)) {
          logsData = response.data;
          this.totalItems = response.total || 0;
          this.totalPages = response.pages || 0;
        } else {
          console.warn('Format de réponse inattendu:', response);
          logsData = [];
        }
        
        this.logs = logsData.map((log: any) => ({
          ...log,
          // Compatibilité avec les anciens logs (champs anglais)
          utilisateurId: log.utilisateurId || log.userId || '0',
          entite: log.entite || log.entity || 'inconnu',
          entiteId: log.entiteId || log.entityId || null,
          ancienneValeur: log.ancienneValeur || log.oldValue || null,
          nouvelleValeur: log.nouvelleValeur || log.newValue || null,
          dateHeure: new Date(log.dateHeure || log.timestamp),
          details: this.getLogDetails(log)
        }));
        
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur chargement des logs:', error);
        this.isLoading = false;
      }
    });
  }

  getLogDetails(log: LogEntry): string {
    switch (log.action) {
      case 'CREATE': return 'Nouvel enregistrement créé';
      case 'UPDATE': return '';
      case 'DELETE': return 'Enregistrement supprimé';
      default: return 'Action effectuée';
    }
  }

  applyFilters(): void {
    this.filteredLogs = this.logs.filter(log => {
      const correspondEntity = !this.filtreEntity || 
        log.entite.toLowerCase().includes(this.filtreEntity.toLowerCase());
      
      const correspondAction = !this.filtreAction || 
        log.action.toLowerCase().includes(this.filtreAction.toLowerCase());

      return correspondEntity && correspondAction;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filtreEntity = '';
    this.filtreAction = '';
    this.applyFilters();
  }
  
  trackByFn(index: number, item: any): any {
    return item.id || item._id || index;
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'CREATE': return '🟢';
      case 'UPDATE': return '🟡';
      case 'DELETE': return '🔴';
      default: return '🔵';
    }
  }
  
  getActionLabel(action: string): string {
    switch (action) {
      case 'CREATE': return 'Création';
      case 'UPDATE': return 'Modification';
      case 'DELETE': return 'Suppression';
      default: return action;
    }
  }
  
  getEntityLabel(entite: string): string {
    const entityLabels: { [key: string]: string } = {
      'utilisateurs': 'Utilisateurs',
      'centres': 'Centres',
      'batiments': 'Bâtiments',
      'etages': 'Étages',
      'emplacements': 'Emplacements',
      'boutiques': 'Boutiques',
      'appels-offre': 'Appels d\'offres',
      'statut': 'Statut Utilisateur',
      'logs': 'Journaux d\'activité'
    };
    
    return entityLabels[entite] || entite.charAt(0).toUpperCase() + entite.slice(1);
  }
  
  openDetailsModal(log: LogEntry): void {
    this.selectedLog = log;
    this.showDetailsModal = true;
  }
  
  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedLog = null;
  }
  
  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadLogs();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadLogs();
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