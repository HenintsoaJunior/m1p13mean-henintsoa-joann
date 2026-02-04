import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CentresService, Emplacement, Etage } from '../../services/centres.service';

@Component({
  selector: 'app-emplacements-crud',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="title-icon">
            <path d="M3,3H21V5H3V3M3,7H21V9H3V7M3,11H21V13H3V11M3,15H21V17H3V15M3,19H21V21H3V19Z" />
          </svg>
          Gestion des Emplacements
        </h1>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
          Nouvel Emplacement
        </button>
      </div>

      <div class="table-container">
        <div class="table-header">
          <h3 class="table-title">Liste des Emplacements</h3>
          <div class="filters">
            <select [(ngModel)]="selectedEtageId" (change)="filterByEtage()" class="form-control">
              <option value="">Tous les étages</option>
              <option *ngFor="let etage of etages" [value]="etage._id">{{ etage.nom }}</option>
            </select>
            <select [(ngModel)]="selectedStatut" (change)="filterEmplacements()" class="form-control">
              <option value="">Tous les statuts</option>
              <option value="libre">Libre</option>
              <option value="occupe">Occupé</option>
              <option value="reserve">Réservé</option>
              <option value="en_travaux">En travaux</option>
              <option value="en_negociation">En négociation</option>
            </select>
            <div class="search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="search-icon">
                <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L20.49,19.78L19.78,20.49L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,4A5.5,5.5 0 0,0 4,9.5A5.5,5.5 0 0,0 9.5,15A5.5,5.5 0 0,0 15,9.5A5.5,5.5 0 0,0 9.5,4Z" />
              </svg>
              <input type="text" placeholder="Rechercher..." [(ngModel)]="searchTerm" (input)="filterEmplacements()">
            </div>
          </div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Nom</th>
              <th>Type</th>
              <th>Étage</th>
              <th>Statut</th>
              <th>Surface (m²)</th>
              <th>Loyer (€)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let emplacement of filteredEmplacements" class="table-row">
              <td><strong>{{ emplacement.code }}</strong></td>
              <td>{{ emplacement.nom || '-' }}</td>
              <td><span class="badge badge-type">{{ emplacement.type }}</span></td>
              <td>{{ getEtageNom(emplacement.etage_id) }}</td>
              <td><span class="badge" [ngClass]="'badge-' + emplacement.statut">{{ emplacement.statut }}</span></td>
              <td>{{ emplacement.surface_m2 || '-' }}</td>
              <td>{{ emplacement.loyer_mensuel || '-' }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon btn-edit" (click)="editEmplacement(emplacement)" title="Modifier">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                    </svg>
                  </button>
                  <button class="btn-icon btn-delete" (click)="deleteEmplacement(emplacement._id!)" title="Supprimer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="filteredEmplacements.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" class="empty-icon">
            <path d="M3,3H21V5H3V3M3,7H21V9H3V7M3,11H21V13H3V11M3,15H21V17H3V15M3,19H21V21H3V19Z" />
          </svg>
          <h3>Aucun emplacement trouvé</h3>
          <p>Commencez par créer votre premier emplacement</p>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div *ngIf="showModal" class="modal-overlay" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">{{ editingEmplacement ? 'Modifier l\'emplacement' : 'Nouvel emplacement' }}</h2>
          <button class="btn-close" (click)="closeModal()">×</button>
        </div>

        <div class="modal-body">
          <form [formGroup]="emplacementForm" (ngSubmit)="onSubmit()" class="form">
            <div class="form-grid">
              <div class="form-group">
                <label for="etage_id">Étage *</label>
                <select id="etage_id" formControlName="etage_id" class="form-control">
                  <option value="">Sélectionner un étage</option>
                  <option *ngFor="let etage of etages" [value]="etage._id">{{ etage.nom }}</option>
                </select>
              </div>

              <div class="form-group">
                <label for="code">Code *</label>
                <input type="text" id="code" formControlName="code" class="form-control" placeholder="Ex: A-12">
              </div>

              <div class="form-group">
                <label for="nom">Nom</label>
                <input type="text" id="nom" formControlName="nom" class="form-control" placeholder="Nom de l'emplacement">
              </div>

              <div class="form-group">
                <label for="type">Type *</label>
                <select id="type" formControlName="type" class="form-control">
                  <option value="">Sélectionner un type</option>
                  <option value="box">Box</option>
                  <option value="kiosque">Kiosque</option>
                  <option value="zone_loisirs">Zone de loisirs</option>
                  <option value="zone_commune">Zone commune</option>
                  <option value="pop_up">Pop-up</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div class="form-group">
                <label for="statut">Statut *</label>
                <select id="statut" formControlName="statut" class="form-control">
                  <option value="libre">Libre</option>
                  <option value="occupe">Occupé</option>
                  <option value="reserve">Réservé</option>
                  <option value="en_travaux">En travaux</option>
                  <option value="en_negociation">En négociation</option>
                </select>
              </div>

              <div class="form-group">
                <label for="surface_m2">Surface (m²)</label>
                <input type="number" id="surface_m2" formControlName="surface_m2" class="form-control" step="0.01">
              </div>

              <div class="form-group">
                <label for="loyer_mensuel">Loyer mensuel (€)</label>
                <input type="number" id="loyer_mensuel" formControlName="loyer_mensuel" class="form-control" step="0.01">
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Annuler</button>
              <button type="submit" class="btn btn-primary" [disabled]="emplacementForm.invalid">
                {{ editingEmplacement ? 'Modifier' : 'Créer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
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
    private formBuilder: FormBuilder
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

  getEtageNom(etageId: string): string {
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
    this.emplacementForm.patchValue(emplacement);
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
        this.centresService.updateEmplacement(this.editingEmplacement._id!, emplacementData).subscribe(() => {
          this.loadData();
          this.closeModal();
        });
      } else {
        this.centresService.createEmplacement(emplacementData).subscribe(() => {
          this.loadData();
          this.closeModal();
        });
      }
    }
  }

  deleteEmplacement(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet emplacement ?')) {
      this.centresService.deleteEmplacement(id).subscribe(() => {
        this.loadData();
      });
    }
  }
}