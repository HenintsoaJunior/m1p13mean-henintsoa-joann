import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CentresService, Centre } from '../../services/centres.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-centre-crud',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './centre-crud.component.html',
  styleUrls: ['./centre-crud.component.scss']
})
export class CentreCrudComponent implements OnInit {
  centres: Centre[] = [];
  filteredCentres: Centre[] = [];
  searchTerm = '';
  showModal = false;
  editingCentre: Centre | null = null;
  isSubmitting = false;
  centreForm: FormGroup;

  constructor(
    private centresService: CentresService,
    private formBuilder: FormBuilder,
    private toastService: ToastService
  ) {
    this.centreForm = this.formBuilder.group({
      nom: ['', [Validators.required]],
      description: [''],
      email_contact: ['', [Validators.email]],
      telephone_contact: [''],
      adresse: this.formBuilder.group({
        rue: [''],
        ville: [''],
        code_postal: [''],
        pays: ['Madagascar'],
      }),
    });
  }

  ngOnInit() {
    this.loadCentres();
  }

  loadCentres() {
    this.centresService.getCentres().subscribe((centres) => {
      this.centres = centres;
      this.filteredCentres = centres;
    });
  }

  filterCentres() {
    this.filteredCentres = this.centres.filter(
      (centre) =>
        centre.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        centre.adresse?.ville?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        centre.email_contact?.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );
  }

  openCreateModal() {
    this.editingCentre = null;
    this.centreForm.reset();
    this.centreForm.patchValue({
      adresse: { pays: 'Madagascar' },
    });
    this.showModal = true;
  }

  editCentre(centre: Centre) {
    this.editingCentre = centre;
    this.centreForm.patchValue(centre);
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingCentre = null;
    this.centreForm.reset();
  }

  onSubmit() {
    if (this.centreForm.valid) {
      this.isSubmitting = true;
      const centreData = this.centreForm.value;

      if (this.editingCentre) {
        this.centresService.updateCentre(this.editingCentre._id!, centreData).subscribe({
          next: () => {
            this.loadCentres();
            this.closeModal();
            this.isSubmitting = false;
            this.toastService.showSuccess('Centre modifié avec succès!');
          },
          error: (error) => {
            this.isSubmitting = false;
            this.toastService.showError('Erreur lors de la modification du centre');
          },
        });
      } else {
        this.centresService.createCentre(centreData).subscribe({
          next: () => {
            this.loadCentres();
            this.closeModal();
            this.isSubmitting = false;
            this.toastService.showSuccess('Centre créé avec succès!');
          },
          error: (error) => {
            this.isSubmitting = false;
            this.toastService.showError('Erreur lors de la création du centre');
          },
        });
      }
    }
  }

  deleteCentre(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce centre ?')) {
      this.centresService.deleteCentre(id).subscribe({
        next: () => {
          this.loadCentres();
          this.toastService.showSuccess('Centre supprimé avec succès!');
        },
        error: (error) => {
          this.toastService.showError('Erreur lors de la suppression du centre');
        }
      });
    }
  }
}
