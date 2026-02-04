import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CentresService, Emplacement, Etage } from '../../services/centres.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-emplacements-crud',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './emplacements-crud.component.html',
  styleUrls: ['./emplacements-crud.component.scss']
})
export class EmplacementsCrudComponent implements OnInit {
  emplacements: Emplacement[] = [];
  filteredEmplacements: Emplacement[] = [];
  etages: Etage[] = [];
  searchTerm = '';
  selectedEtageId = '';
  selectedStatut = '';
  showModal = false;
  editingEmplacement: Emplacement | null = null;
  emplacementForm: FormGroup;

  constructor(
    private centresService: CentresService,
    private formBuilder: FormBuilder,
    private toastService: ToastService
  ) {
    this.emplacementForm = this.formBuilder.group({
      etage_id: ['', [Validators.required]],
      code: ['', [Validators.required]],
      nom: [''],
      type: ['', [Validators.required]],
      statut: ['libre', [Validators.required]],
      surface_m2: [null],
      loyer_mensuel: [null]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.centresService.getEtages().subscribe(etages => {
      this.etages = etages;
    });

    this.centresService.getEmplacements().subscribe(emplacements => {
      this.emplacements = emplacements;
      this.filteredEmplacements = emplacements;
    });
  }

  filterByEtage() {
    this.filterEmplacements();
  }

  filterEmplacements() {
    this.filteredEmplacements = this.emplacements.filter(emplacement => {
      const matchesSearch = emplacement.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          emplacement.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          emplacement.type.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesEtage = !this.selectedEtageId || emplacement.etage_id === this.selectedEtageId;
      const matchesStatut = !this.selectedStatut || emplacement.statut === this.selectedStatut;
      return matchesSearch && matchesEtage && matchesStatut;
    });
  }

  getEtageNom(etageId: string | { _id: string; nom: string }): string {
    // Si c'est un objet populé, on retourne directement le nom
    if (typeof etageId === 'object' && etageId !== null) {
      return etageId.nom;
    }
    // Sinon, on cherche dans la liste des étages
    const etage = this.etages.find(e => e._id === etageId);
    return etage ? etage.nom : 'Étage inconnu';
  }

  openCreateModal() {
    this.editingEmplacement = null;
    this.emplacementForm.reset();
    this.emplacementForm.patchValue({ statut: 'libre' });
    this.showModal = true;
  }

  editEmplacement(emplacement: Emplacement) {
    this.editingEmplacement = emplacement;
    // Extraire l'ID si etage_id est un objet populé
    const etageId = typeof emplacement.etage_id === 'object' ? emplacement.etage_id._id : emplacement.etage_id;
    this.emplacementForm.patchValue({
      ...emplacement,
      etage_id: etageId
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingEmplacement = null;
    this.emplacementForm.reset();
  }

  onSubmit() {
    if (this.emplacementForm.valid) {
      const emplacementData = this.emplacementForm.value;

      if (this.editingEmplacement) {
        this.centresService.updateEmplacement(this.editingEmplacement._id!, emplacementData).subscribe({
          next: () => {
            this.loadData();
            this.closeModal();
            this.toastService.showSuccess('Emplacement modifié avec succès!');
          },
          error: () => {
            this.toastService.showError('Erreur lors de la modification de l\'emplacement');
          }
        });
      } else {
        this.centresService.createEmplacement(emplacementData).subscribe({
          next: () => {
            this.loadData();
            this.closeModal();
            this.toastService.showSuccess('Emplacement créé avec succès!');
          },
          error: () => {
            this.toastService.showError('Erreur lors de la création de l\'emplacement');
          }
        });
      }
    }
  }

  deleteEmplacement(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet emplacement ?')) {
      this.centresService.deleteEmplacement(id).subscribe({
        next: () => {
          this.loadData();
          this.toastService.showSuccess('Emplacement supprimé avec succès!');
        },
        error: () => {
          this.toastService.showError('Erreur lors de la suppression de l\'emplacement');
        }
      });
    }
  }
}
