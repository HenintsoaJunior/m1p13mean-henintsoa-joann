import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CentresService, Batiment, Centre } from '../../services/centres.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-batiments-crud',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './batiments-crud.component.html',
  styleUrls: ['./batiments-crud.component.scss']
})
export class BatimentsCrudComponent implements OnInit {
  batiments: Batiment[] = [];
  filteredBatiments: Batiment[] = [];
  centres: Centre[] = [];
  searchTerm = '';
  selectedCentreId = '';
  showModal = false;
  editingBatiment: Batiment | null = null;
  isSubmitting = false;
  batimentForm: FormGroup;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50];

  constructor(
    private centresService: CentresService,
    private formBuilder: FormBuilder,
    private toastService: ToastService
  ) {
    this.batimentForm = this.formBuilder.group({
      centre_id: ['', [Validators.required]],
      nom: ['', [Validators.required]],
      description: [''],
      nombre_etages: [0, [Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.centresService.getAllCentres().subscribe(centres => {
      this.centres = centres;
    });

    this.loadBatiments();
  }

  loadBatiments() {
    this.centresService.getBatimentsPaginated(this.currentPage, this.pageSize).subscribe((response: any) => {
      if (response && response.success && response.data) {
        const data = response.data;
        this.batiments = data.batiments || data.docs || (Array.isArray(data) ? data : []);
        this.totalItems = data.total || 0;
        this.totalPages = data.pages || 0;
        this.currentPage = data.page || this.currentPage;
      } else if (Array.isArray(response)) {
        this.batiments = response;
        this.totalItems = response.length;
        this.totalPages = 1;
      }
      this.filteredBatiments = this.batiments;
      if (this.searchTerm || this.selectedCentreId) {
        this.filterBatiments();
      }
    });
  }

  filterByCentre() {
    this.filterBatiments();
  }

  filterBatiments() {
    this.filteredBatiments = this.batiments.filter(batiment => {
      const matchesSearch = batiment.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          batiment.description?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCentre = !this.selectedCentreId || batiment.centre_id === this.selectedCentreId;
      return matchesSearch && matchesCentre;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCentreId = '';
    this.filterBatiments();
  }

  getCentreNom(centreId: string | { _id: string; nom: string }): string {
    // Si c'est un objet populé, on retourne directement le nom
    if (typeof centreId === 'object' && centreId !== null) {
      return centreId.nom;
    }
    // Sinon, on cherche dans la liste des centres
    const centre = this.centres.find(c => c._id === centreId);
    return centre ? centre.nom : 'Centre inconnu';
  }

  openCreateModal() {
    this.editingBatiment = null;
    this.batimentForm.reset();
    this.batimentForm.patchValue({ nombre_etages: 0 });
    this.showModal = true;
  }

  editBatiment(batiment: Batiment) {
    this.editingBatiment = batiment;
    // Extraire l'ID si centre_id est un objet populé
    const centreId = typeof batiment.centre_id === 'object' ? batiment.centre_id._id : batiment.centre_id;
    this.batimentForm.patchValue({
      ...batiment,
      centre_id: centreId
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingBatiment = null;
    this.batimentForm.reset();
  }

  onSubmit() {
    if (this.batimentForm.valid) {
      this.isSubmitting = true;
      const batimentData = this.batimentForm.value;

      if (this.editingBatiment) {
        this.centresService.updateBatiment(this.editingBatiment._id!, batimentData).subscribe({
          next: () => {
            this.loadBatiments();
            this.closeModal();
            this.isSubmitting = false;
            this.toastService.showSuccess('Bâtiment modifié avec succès!');
          },
          error: () => {
            this.isSubmitting = false;
            this.toastService.showError('Erreur lors de la modification du bâtiment');
          }
        });
      } else {
        this.centresService.createBatiment(batimentData).subscribe({
          next: () => {
            this.loadBatiments();
            this.closeModal();
            this.isSubmitting = false;
            this.toastService.showSuccess('Bâtiment créé avec succès!');
          },
          error: () => {
            this.isSubmitting = false;
            this.toastService.showError('Erreur lors de la création du bâtiment');
          }
        });
      }
    }
  }

  deleteBatiment(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce bâtiment ?')) {
      this.centresService.deleteBatiment(id).subscribe({
        next: () => {
          this.loadBatiments();
          this.toastService.showSuccess('Bâtiment supprimé avec succès!');
        },
        error: () => {
          this.toastService.showError('Erreur lors de la suppression du bâtiment');
        }
      });
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadBatiments();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadBatiments();
  }

  get pages(): number[] {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}