import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppelsOffreService, AppelOffreDto } from '../../services/appels-offre.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth.service';
import { ResponseFormClientComponent } from './response-form-client.component';

@Component({
  selector: 'app-appels-offre-client',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ResponseFormClientComponent],
  templateUrl: './appels-offre-client.component.html',
  styleUrl: './appels-offre-client.component.scss'
})
export class AppelsOffreClientComponent implements OnInit {
  appelsOffre: AppelOffreDto[] = [];
  loading = false;
  searchTerm = '';
  
  // modal state (soumettre)
  showModal = false;
  selectedAppel: AppelOffreDto | null = null;

  // modal state (détails)
  showDetailModal = false;
  detailAppel: AppelOffreDto | null = null;

  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  constructor(
    private appelsOffreSvc: AppelsOffreService,
    private toastService: ToastService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAppels();
  }

  loadAppels(): void {
    this.loading = true;
    this.appelsOffreSvc.getAllAppelsOuverts(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        if (res && res.data) {
          const data = res.data;
          this.appelsOffre = Array.isArray(data) ? data : (Array.isArray(data.appelsOffre) ? data.appelsOffre : []);
          
          // Parse pagination
          if (data.pagination) {
            this.totalItems = data.pagination.total || 0;
            this.totalPages = data.pagination.pages || Math.ceil(this.totalItems / this.pageSize);
          }
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement appels:', err);
        this.toastService.showError('Erreur lors du chargement des appels d\'offre');
        this.loading = false;
      }
    });
  }

  get filteredAppels(): AppelOffreDto[] {
    if (!this.searchTerm) return this.appelsOffre;
    return this.appelsOffre.filter(a => 
      a.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      a.emplacement?.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      a.emplacement?.code?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openModal(appel: AppelOffreDto): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/client-login']);
      return;
    }
    this.selectedAppel = appel;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedAppel = null;
  }

  openDetailModal(appel: AppelOffreDto, event?: Event): void {
    event?.stopPropagation();
    this.detailAppel = appel;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.detailAppel = null;
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      box: 'Box', kiosque: 'Kiosque', zone_loisirs: 'Zone loisirs',
      zone_commune: 'Zone commune', pop_up: 'Pop-up', autre: 'Autre'
    };
    return labels[type] || type;
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      libre: 'Libre', occupe: 'Occupé', reserve: 'Réservé',
      en_travaux: 'En travaux', en_negociation: 'En négociation'
    };
    return labels[statut] || statut;
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadAppels();
    }
  }

  onPageSizeChange(event?: any): void {
    const value = event?.target?.value || this.pageSize;
    this.pageSize = parseInt(value, 10);
    this.currentPage = 1;
    this.loadAppels();
  }

  getPaginationItems(): number[] {
    const items: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(i);
    }
    return items;
  }
}
