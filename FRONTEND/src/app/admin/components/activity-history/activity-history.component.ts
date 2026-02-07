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

  // Filtres
  filtreEntity: string = '';
  filtreAction: string = '';
  
  // Variables pour le modal
  showDetailsModal: boolean = false;
  selectedLog: LogEntry | null = null;

  constructor(private logService: LogService) { }

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.logService.getLogs().subscribe({
      next: (response: any) => {
        // Handle both direct array and response object with data property
        let logsData: LogEntry[] = [];
        
        if (Array.isArray(response)) {
          logsData = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          logsData = response.data;
        } else {
          console.warn('Unexpected response format:', response);
          logsData = [];
        }
        
        this.logs = logsData.map(log => ({
          ...log,
          timestamp: new Date(log.timestamp),
          details: this.getLogDetails(log)
        })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort by newest first
        
        this.applyFilters();
      },
      error: (error: any) => {
        console.error('Error loading logs:', error);
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
        log.entity.toLowerCase().includes(this.filtreEntity.toLowerCase());
      
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
  
  getEntityLabel(entity: string): string {
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
    
    return entityLabels[entity] || entity.charAt(0).toUpperCase() + entity.slice(1);
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
}