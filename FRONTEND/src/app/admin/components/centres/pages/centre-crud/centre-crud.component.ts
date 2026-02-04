import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CentresService, Centre } from '../../services/centres.service';

@Component({
  selector: 'app-centre-crud',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="title-icon">
            <path d="M15,7H20.5L20,4H17V2H15M6.5,2V4H3.5L3,7H8.5V2M9,7H15V9H9M15,10V15H13V12H11V15H9V10M8,17V22H10V17M14,17V22H16V17M5,9H19V17H17V15H13V17H11V15H7V17H5Z" />
          </svg>
          Gestion des Centres
        </h1>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
          Nouveau Centre
        </button>
      </div>

      <!-- Table des centres -->
      <div class="table-container">
        <div class="table-header">
          <h3 class="table-title">Liste des Centres Commerciaux</h3>
          <div class="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="search-icon">
              <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L20.49,19.78L19.78,20.49L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,4A5.5,5.5 0 0,0 4,9.5A5.5,5.5 0 0,0 9.5,15A5.5,5.5 0 0,0 15,9.5A5.5,5.5 0 0,0 9.5,4Z" />
            </svg>
            <input type="text" placeholder="Rechercher un centre..." [(ngModel)]="searchTerm" (input)="filterCentres()">
          </div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Ville</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Créé le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let centre of filteredCentres" class="table-row">
              <td>
                <div class="centre-info">
                  <div class="centre-name">{{ centre.nom }}</div>
                  <div class="centre-slug">{{ centre.slug }}</div>
                </div>
              </td>
              <td>{{ centre.adresse?.ville || '-' }}</td>
              <td>{{ centre.email_contact || '-' }}</td>
              <td>{{ centre.telephone_contact || '-' }}</td>
              <td>{{ centre.cree_le | date:'dd/MM/yyyy' }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon btn-edit" (click)="editCentre(centre)" title="Modifier">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                    </svg>
                  </button>
                  <button class="btn-icon btn-delete" (click)="deleteCentre(centre._id!)" title="Supprimer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="filteredCentres.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" class="empty-icon">
            <path d="M15,7H20.5L20,4H17V2H15M6.5,2V4H3.5L3,7H8.5V2M9,7H15V9H9M15,10V15H13V12H11V15H9V10M8,17V22H10V17M14,17V22H16V17M5,9H19V17H17V15H13V17H11V15H7V17H5Z" />
          </svg>
          <h3>Aucun centre trouvé</h3>
          <p>Commencez par créer votre premier centre commercial</p>
        </div>
      </div>
    </div>

    <!-- Modal pour créer/modifier un centre -->
    <div *ngIf="showModal" class="modal-overlay" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">{{ editingCentre ? 'Modifier le centre' : 'Nouveau centre' }}</h2>
          <button class="btn-close" (click)="closeModal()">×</button>
        </div>

        <div class="modal-body">
          <form [formGroup]="centreForm" (ngSubmit)="onSubmit()" class="form">
            <div class="form-grid">
              <div class="form-group">
                <label for="nom">Nom du centre *</label>
                <input type="text" id="nom" formControlName="nom" class="form-control" placeholder="Ex: Akoor Antananarivo">
                <div *ngIf="centreForm.get('nom')?.errors && centreForm.get('nom')?.touched" class="error-message">
                  Le nom est requis
                </div>
              </div>

              <div class="form-group">
                <label for="email">Email de contact</label>
                <input type="email" id="email" formControlName="email_contact" class="form-control" placeholder="contact@centre.com">
              </div>

              <div class="form-group">
                <label for="telephone">Téléphone</label>
                <input type="tel" id="telephone" formControlName="telephone_contact" class="form-control" placeholder="+261 20 XX XX XXX">
              </div>

              <div class="form-group full-width">
                <label for="description">Description</label>
                <textarea id="description" formControlName="description" class="form-control" rows="3" placeholder="Description du centre commercial..."></textarea>
              </div>
            </div>

            <!-- Adresse -->
            <div class="form-section">
              <h3 class="form-section-title">Adresse</h3>
              <div class="form-grid" formGroupName="adresse">
                <div class="form-group">
                  <label for="rue">Rue</label>
                  <input type="text" id="rue" formControlName="rue" class="form-control" placeholder="Nom de la rue">
                </div>

                <div class="form-group">
                  <label for="ville">Ville</label>
                  <input type="text" id="ville" formControlName="ville" class="form-control" placeholder="Ville">
                </div>

                <div class="form-group">
                  <label for="code_postal">Code postal</label>
                  <input type="text" id="code_postal" formControlName="code_postal" class="form-control" placeholder="101">
                </div>

                <div class="form-group">
                  <label for="pays">Pays</label>
                  <input type="text" id="pays" formControlName="pays" class="form-control" placeholder="Madagascar">
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Annuler</button>
              <button type="submit" class="btn btn-primary" [disabled]="centreForm.invalid || isSubmitting">
                {{ isSubmitting ? 'En cours...' : (editingCentre ? 'Modifier' : 'Créer') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .centre-info .centre-name {
      font-weight: 500;
      color: var(--text-primary);
    }

    .centre-info .centre-slug {
      font-size: 12px;
      color: var(--text-tertiary);
      margin-top: 2px;
    }
  `]
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
    private formBuilder: FormBuilder
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
        pays: ['Madagascar']
      })
    });
  }

  ngOnInit() {
    this.loadCentres();
  }

  loadCentres() {
    this.centresService.getCentres().subscribe(centres => {
      this.centres = centres;
      this.filteredCentres = centres;
    });
  }

  filterCentres() {
    this.filteredCentres = this.centres.filter(centre =>
      centre.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      centre.adresse?.ville?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      centre.email_contact?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openCreateModal() {
    this.editingCentre = null;
    this.centreForm.reset();
    this.centreForm.patchValue({
      adresse: { pays: 'Madagascar' }
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
          },
          error: () => {
            this.isSubmitting = false;
          }
        });
      } else {
        this.centresService.createCentre(centreData).subscribe({
          next: () => {
            this.loadCentres();
            this.closeModal();
            this.isSubmitting = false;
          },
          error: () => {
            this.isSubmitting = false;
          }
        });
      }
    }
  }

  deleteCentre(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce centre ?')) {
      this.centresService.deleteCentre(id).subscribe(() => {
        this.loadCentres();
      });
    }
  }
}