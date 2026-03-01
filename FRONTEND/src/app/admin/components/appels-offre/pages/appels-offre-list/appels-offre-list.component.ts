import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppelsOffresService, AppelOffre } from '../../services/appels-offre.service';
import { CentresService, Emplacement } from '../../../centres/services/centres.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-appels-offre-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appels-offre-list.component.html',
  styleUrls: ['./appels-offre-list.component.scss']
})
export class AppelsOffreListComponent implements OnInit {
  appels: AppelOffre[] = [];
  emplacements: Emplacement[] = [];
  loading = false;
  showForm = false;

  form = {
    emplacement_id: '',
    description: '',
    statut: 'ouvert'
  };

  // Filtre
  filteredAppels: AppelOffre[] = [];
  filtreEmplacement: string = '';
  filtreStatut: string = '';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50];

  constructor(
    private appelsService: AppelsOffresService,
    private centresService: CentresService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAppels();
    this.loadEmplacements();
  }

  loadAppels() {
    this.loading = true;
    this.appelsService.getAllAppels(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.appels = res.data.appelsOffre || [];
          this.totalItems = res.data.pagination?.total || 0;
          this.totalPages = res.data.pagination?.pages || 0;
        } else {
          this.appels = [];
          this.totalItems = 0;
          this.totalPages = 1;
        }
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement appels:', err);
        this.loading = false;
      },
    });
  }

  applyFilters() {
    this.filteredAppels = this.appels.filter(appel => {
      // Filtre par statut
      const correspondStatut = !this.filtreStatut || appel.statut === this.filtreStatut;

      // Filtre par emplacement (utilise getEmplacementNom pour gérer populate/id)
      const emplacementNom = this.getEmplacementNom(appel.emplacement_id).toLowerCase();
      const correspondEmplacement = !this.filtreEmplacement || emplacementNom.includes(this.filtreEmplacement.toLowerCase());

      return correspondStatut && correspondEmplacement;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filtreEmplacement = '';
    this.filtreStatut = '';
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadAppels();
    }
  }

  onPageSizeChange(event?: any): void {
    this.currentPage = 1;
    this.loadAppels();
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

  loadEmplacements() {
    this.centresService.getEmplacements().subscribe({
      next: (emplacements: Emplacement[]) => {
        // Filtrer pour garder seulement les emplacements disponibles (statut 'libre')
        this.emplacements = emplacements.filter(emp => emp.statut === 'libre');
      },
      error: (err: any) => console.error('Erreur chargement emplacements:', err),
    });
  }

  submit() {
    if (!this.form.emplacement_id || !this.form.description) {
      this.toastService.showError('Tous les champs sont requis');
      return;
    }

    this.appelsService.createAppel({
      emplacement_id: this.form.emplacement_id,
      description: this.form.description,
      statut: this.form.statut as any,
    }).subscribe({
      next: () => {
        this.toastService.showSuccess('Appel d\'offre créé avec succès');
        this.form = { emplacement_id: '', description: '', statut: 'ouvert' };
        this.showForm = false;
        this.currentPage = 1;
        this.loadAppels();
      },
      error: (err) => this.toastService.showError(err.error?.message || 'Erreur création appel'),
    });
  }

  delete(id: string | undefined) {
    if (!id) {
      this.toastService.showError('ID introuvable');
      return;
    }

    // Vérifier si l'appel d'offre est attribué
    const appel = this.appels.find(a => a._id === id);
    if (appel && appel.statut === 'attribue') {
      this.toastService.showError('Impossible de supprimer un appel d\'offre déjà attribué');
      return;
    }

    this.appelsService.deleteAppel(id).subscribe({
      next: () => {
        this.toastService.showSuccess('Appel d\'offre supprimé avec succès');
        this.currentPage = 1;
        this.loadAppels();
      },
      error: (err) => this.toastService.showError(err.error?.message || 'Erreur suppression'),
    });
  }

  getEmplacementNom(emp: any): string {
    if (!emp) return '—';
    
    // Si c'est un objet (populate du backend)
    if (typeof emp === 'object') {
      return `${emp.code || '?'} (${emp.type || '?'})`;
    }
    
    // Si c'est une string ID, chercher dans la liste
    const found = this.emplacements.find(e => e._id === emp);
    return found ? `${found.code} (${found.type})` : '—';
  }
}
