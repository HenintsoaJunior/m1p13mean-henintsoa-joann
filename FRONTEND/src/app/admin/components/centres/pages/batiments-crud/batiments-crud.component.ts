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
    this.centresService.getCentres().subscribe(centres => {
      this.centres = centres;
    });

    this.centresService.getBatiments().subscribe(batiments => {
      this.batiments = batiments;
      this.filteredBatiments = batiments;
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

  getCentreNom(centreId: string): string {
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
    this.batimentForm.patchValue(batiment);
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
            this.loadData();
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
            this.loadData();
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
          this.loadData();
          this.toastService.showSuccess('Bâtiment supprimé avec succès!');
        },
        error: () => {
          this.toastService.showError('Erreur lors de la suppression du bâtiment');
        }
      });
    }
  }
}