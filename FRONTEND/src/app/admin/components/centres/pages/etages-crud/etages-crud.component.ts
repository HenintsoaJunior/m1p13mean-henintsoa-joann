import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CentresService, Etage, Batiment, Centre } from '../../services/centres.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-etages-crud',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './etages-crud.component.html',
  styleUrls: ['./etages-crud.component.scss']
})
export class EtagesCrudComponent implements OnInit {
  etages: Etage[] = [];
  filteredEtages: Etage[] = [];
  batiments: Batiment[] = [];
  centres: Centre[] = [];
  searchTerm = '';
  selectedBatimentId = '';
  selectedCentreId = '';
  showModal = false;
  editingEtage: Etage | null = null;
  isSubmitting = false;
  etageForm: FormGroup;

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
    this.etageForm = this.formBuilder.group({
      batiment_id: ['', [Validators.required]],
      nom: ['', [Validators.required]],
      niveau: [0, [Validators.required]],
      surface_totale_m2: [null],
      hauteur_sous_plafond_m: [null]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.centresService.getAllCentres().subscribe(centres => {
      this.centres = centres;
    });

    this.centresService.getBatiments().subscribe(batiments => {
      this.batiments = batiments;
    });

    this.loadEtages();
  }

  loadEtages() {
    this.centresService.getEtagesPaginated(this.currentPage, this.pageSize).subscribe((response: any) => {
      if (response && response.success && response.data) {
        const data = response.data;
        this.etages = data.etages || data.docs || (Array.isArray(data) ? data : []);
        this.totalItems = data.total || 0;
        this.totalPages = data.pages || 0;
        this.currentPage = data.page || this.currentPage;
      } else if (Array.isArray(response)) {
        this.etages = response;
        this.totalItems = response.length;
        this.totalPages = 1;
      }
      this.filteredEtages = this.etages;
      if (this.searchTerm || this.selectedBatimentId || this.selectedCentreId) {
        this.filterEtages();
      }
    });
  }

  filterByCentre() {
    // Réinitialiser le filtre bâtiment quand on change de centre
    this.selectedBatimentId = '';
    this.filterEtages();
  }

  filterByBatiment() {
    this.filterEtages();
  }

  filterEtages() {
    this.filteredEtages = this.etages.filter(etage => {
      const matchesSearch = etage.nom.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesBatiment = !this.selectedBatimentId ||
        (typeof etage.batiment_id === 'object' ? etage.batiment_id._id === this.selectedBatimentId : etage.batiment_id === this.selectedBatimentId);

      // Filtre par centre via le bâtiment
      let matchesCentre = true;
      if (this.selectedCentreId) {
        const batiment = this.batiments.find(b =>
          typeof etage.batiment_id === 'object' ? b._id === etage.batiment_id._id : b._id === etage.batiment_id
        );
        if (batiment) {
          matchesCentre = typeof batiment.centre_id === 'object' ?
            batiment.centre_id._id === this.selectedCentreId :
            batiment.centre_id === this.selectedCentreId;
        } else {
          matchesCentre = false;
        }
      }

      return matchesSearch && matchesBatiment && matchesCentre;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedBatimentId = '';
    this.selectedCentreId = '';
    this.filterEtages();
  }

  getFilteredBatiments(): Batiment[] {
    if (!this.selectedCentreId) {
      return this.batiments;
    }
    return this.batiments.filter(b => 
      typeof b.centre_id === 'object' ? b.centre_id._id === this.selectedCentreId : b.centre_id === this.selectedCentreId
    );
  }

  getBatimentNom(batimentId: string | { _id: string; nom: string }): string {
    // Si c'est un objet populé, on retourne directement le nom
    if (typeof batimentId === 'object' && batimentId !== null) {
      return batimentId.nom;
    }
    // Sinon, on cherche dans la liste des bâtiments
    const batiment = this.batiments.find(b => b._id === batimentId);
    return batiment ? batiment.nom : 'Bâtiment inconnu';
  }

  openCreateModal() {
    this.editingEtage = null;
    this.etageForm.reset();
    this.etageForm.patchValue({ niveau: 0 });
    this.showModal = true;
  }

  // Obtenir le nom complet d'un bâtiment avec son centre
  getBatimentFullName(batiment: Batiment): string {
    const centreId = typeof batiment.centre_id === 'object' ? batiment.centre_id._id : batiment.centre_id;
    const centre = this.centres.find(c => c._id === centreId);
    return centre ? `${batiment.nom} - ${centre.nom}` : batiment.nom;
  }

  editEtage(etage: Etage) {
    this.editingEtage = etage;
    // Extraire l'ID si batiment_id est un objet populé
    const batimentId = typeof etage.batiment_id === 'object' && etage.batiment_id ? etage.batiment_id._id : etage.batiment_id;
    
    this.etageForm.patchValue({
      ...etage,
      batiment_id: batimentId
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingEtage = null;
    this.etageForm.reset();
  }

  onSubmit() {
    if (this.etageForm.valid) {
      this.isSubmitting = true;
      const etageData = this.etageForm.value;

      if (this.editingEtage) {
        this.centresService.updateEtage(this.editingEtage._id!, etageData).subscribe({
          next: () => {
            this.loadEtages();
            this.closeModal();
            this.isSubmitting = false;
            this.toastService.showSuccess('Étage modifié avec succès!');
          },
          error: () => {
            this.isSubmitting = false;
            this.toastService.showError('Erreur lors de la modification de l\'étage');
          }
        });
      } else {
        this.centresService.createEtage(etageData).subscribe({
          next: () => {
            this.loadEtages();
            this.closeModal();
            this.isSubmitting = false;
            this.toastService.showSuccess('Étage créé avec succès!');
          },
          error: () => {
            this.isSubmitting = false;
            this.toastService.showError('Erreur lors de la création de l\'étage');
          }
        });
      }
    }
  }

  deleteEtage(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet étage ?')) {
      this.centresService.deleteEtage(id).subscribe({
        next: () => {
          this.loadEtages();
          this.toastService.showSuccess('Étage supprimé avec succès!');
        },
        error: () => {
          this.toastService.showError('Erreur lors de la suppression de l\'étage');
        }
      });
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadEtages();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadEtages();
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
