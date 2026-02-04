import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CentresService, Etage, Batiment } from '../../services/centres.service';
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
  searchTerm = '';
  selectedBatimentId = '';
  showModal = false;
  editingEtage: Etage | null = null;
  etageForm: FormGroup;

  constructor(
    private centresService: CentresService,
    private formBuilder: FormBuilder,
    private toastService: ToastService
  ) {
    this.etageForm = this.formBuilder.group({
      batiment_id: [''],
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
    this.centresService.getBatiments().subscribe(batiments => {
      this.batiments = batiments;
    });

    this.centresService.getEtages().subscribe(etages => {
      this.etages = etages;
      this.filteredEtages = etages;
    });
  }

  filterByBatiment() {
    this.filterEtages();
  }

  filterEtages() {
    this.filteredEtages = this.etages.filter(etage => {
      const matchesSearch = etage.nom.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesBatiment = !this.selectedBatimentId || etage.batiment_id === this.selectedBatimentId;
      return matchesSearch && matchesBatiment;
    });
  }

  getBatimentNom(batimentId: string): string {
    const batiment = this.batiments.find(b => b._id === batimentId);
    return batiment ? batiment.nom : 'Bâtiment inconnu';
  }

  openCreateModal() {
    this.editingEtage = null;
    this.etageForm.reset();
    this.showModal = true;
  }

  editEtage(etage: Etage) {
    this.editingEtage = etage;
    this.etageForm.patchValue(etage);
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingEtage = null;
    this.etageForm.reset();
  }

  onSubmit() {
    if (this.etageForm.valid) {
      const etageData = this.etageForm.value;

      if (this.editingEtage) {
        this.centresService.updateEtage(this.editingEtage._id!, etageData).subscribe({
          next: () => {
            this.loadData();
            this.closeModal();
            this.toastService.showSuccess('Étage modifié avec succès!');
          },
          error: () => {
            this.toastService.showError('Erreur lors de la modification de l\'étage');
          }
        });
      } else {
        this.centresService.createEtage(etageData).subscribe({
          next: () => {
            this.loadData();
            this.closeModal();
            this.toastService.showSuccess('Étage créé avec succès!');
          },
          error: () => {
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
          this.loadData();
          this.toastService.showSuccess('Étage supprimé avec succès!');
        },
        error: () => {
          this.toastService.showError('Erreur lors de la suppression de l\'étage');
        }
      });
    }
  }
}
