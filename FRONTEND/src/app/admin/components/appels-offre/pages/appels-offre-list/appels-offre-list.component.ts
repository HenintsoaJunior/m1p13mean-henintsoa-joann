import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AppelsOffresService, AppelOffre } from '../../services/appels-offre.service';
import { CentresService, Emplacement } from '../../../centres/services/centres.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-appels-offre-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './appels-offre-list.component.html',
  styleUrls: ['./appels-offre-list.component.scss']
})
export class AppelsOffreListComponent implements OnInit {
  appels: AppelOffre[] = [];
  emplacements: Emplacement[] = [];
  loading = false;
  showModal = false;
  isSubmitting = false;

  form = { emplacement_id: '', description: '', statut: 'ouvert' };

  filteredAppels: AppelOffre[] = [];
  filtreEmplacement: string = '';
  filtreStatut: string = '';

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  pageSizeOptions = [5, 10, 25, 50];

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
        if (res?.data) {
          this.appels = res.data.appelsOffre || [];
          this.totalItems = res.data.total || res.data.pagination?.total || 0;
          this.totalPages = res.data.pages || res.data.pagination?.pages || 1;
        } else {
          this.appels = [];
          this.totalItems = 0;
          this.totalPages = 1;
        }
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  applyFilters() {
    this.filteredAppels = this.appels.filter(appel => {
      const correspondStatut = !this.filtreStatut || appel.statut === this.filtreStatut;
      const nom = this.getEmplacementNom(appel.emplacement_id).toLowerCase();
      const correspondEmp = !this.filtreEmplacement || nom.includes(this.filtreEmplacement.toLowerCase());
      return correspondStatut && correspondEmp;
    });
  }

  onFilterChange() { this.applyFilters(); }

  clearFilters() {
    this.filtreEmplacement = '';
    this.filtreStatut = '';
    this.applyFilters();
  }

  openCreateModal() { this.showModal = true; }
  closeModal() {
    this.showModal = false;
    this.isSubmitting = false;
    this.form = { emplacement_id: '', description: '', statut: 'ouvert' };
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) { this.currentPage = page; this.loadAppels(); }
  }

  onPageSizeChange() { this.currentPage = 1; this.loadAppels(); }

  get pages(): number[] {
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    const result: number[] = [];
    for (let i = start; i <= end; i++) result.push(i);
    return result;
  }

  loadEmplacements() {
    this.centresService.getEmplacements().subscribe({
      next: (emplacements: Emplacement[]) => {
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
    this.isSubmitting = true;
    this.appelsService.createAppel({
      emplacement_id: this.form.emplacement_id,
      description: this.form.description,
      statut: this.form.statut as any,
    }).subscribe({
      next: () => {
        this.toastService.showSuccess('Appel d\'offre créé avec succès');
        this.closeModal();
        this.currentPage = 1;
        this.loadAppels();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.showError(err.error?.message || 'Erreur création appel');
      },
    });
  }

  delete(id: string | undefined) {
    if (!id) return;
    const appel = this.appels.find(a => a._id === id);
    if (appel?.statut === 'attribue') {
      this.toastService.showError('Impossible de supprimer un appel d\'offre attribué');
      return;
    }
    this.appelsService.deleteAppel(id).subscribe({
      next: () => { this.toastService.showSuccess('Appel d\'offre supprimé'); this.currentPage = 1; this.loadAppels(); },
      error: (err) => this.toastService.showError(err.error?.message || 'Erreur suppression'),
    });
  }

  getEmplacementNom(emp: any): string {
    if (!emp) return '—';
    if (typeof emp === 'object') return `${emp.code || '?'} (${emp.type || '?'})`;
    const found = this.emplacements.find(e => e._id === emp);
    return found ? `${found.code} (${found.type})` : '—';
  }

  getStatutLabel(statut: string | undefined): string {
    return { ouvert: 'Ouvert', ferme: 'Fermé', attribue: 'Attribué' }[statut ?? ''] ?? (statut ?? '—');
  }
}
