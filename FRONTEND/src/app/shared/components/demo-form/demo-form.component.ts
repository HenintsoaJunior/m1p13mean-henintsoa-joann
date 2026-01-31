import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardComponent } from '../card/card.component';
import { FormComponent } from '../form/form.component';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-demo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, FormComponent, ModalComponent],
  template: `
    <div class="demo-container">
      <!-- Exemple de formulaire dans une card -->
      <app-card title="Exemple de formulaire" [hasFooter]="true">
        <app-form>
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label class="form-label required" for="name">Nom</label>
              <input 
                id="name" 
                type="text" 
                class="form-input"
                [class.error]="userForm.get('name')?.invalid && userForm.get('name')?.touched"
                formControlName="name"
                placeholder="Saisissez votre nom"
              />
              <div class="form-error" *ngIf="userForm.get('name')?.invalid && userForm.get('name')?.touched">
                Le nom est requis
              </div>
            </div>

            <div class="form-group">
              <label class="form-label required" for="email">Email</label>
              <input 
                id="email" 
                type="email" 
                class="form-input"
                [class.error]="userForm.get('email')?.invalid && userForm.get('email')?.touched"
                formControlName="email"
                placeholder="exemple@email.com"
              />
              <div class="form-error" *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched">
                Email invalide
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="description">Description</label>
              <textarea 
                id="description" 
                class="form-textarea"
                formControlName="description"
                placeholder="Description optionnelle..."
                rows="4"
              ></textarea>
              <div class="form-help">Maximum 500 caractères</div>
            </div>

            <div class="form-group">
              <label class="form-label" for="category">Catégorie</label>
              <select id="category" class="form-select" formControlName="category">
                <option value="">Sélectionnez une catégorie</option>
                <option value="admin">Administrateur</option>
                <option value="user">Utilisateur</option>
                <option value="boutique">Boutique</option>
              </select>
            </div>

            <div class="form-group">
              <div class="form-checkbox">
                <input 
                  type="checkbox" 
                  id="notifications" 
                  formControlName="notifications"
                />
                <label for="notifications">Recevoir les notifications par email</label>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" (click)="resetForm()">Annuler</button>
              <button type="submit" class="btn-primary" [disabled]="userForm.invalid">
                Enregistrer
              </button>
            </div>
          </form>
        </app-form>

        <div slot="footer">
          <button type="button" (click)="openModal()" class="btn-success">
            Ouvrir Modal
          </button>
        </div>
      </app-card>

      <!-- Modal de démonstration -->
      <app-modal 
        [isOpen]="isModalOpen" 
        title="Confirmation" 
        [hasFooter]="true"
        (onClose)="closeModal()"
      >
        <p>Voulez-vous vraiment enregistrer ces informations ?</p>
        <p class="text-gray-500">Cette action ne peut pas être annulée.</p>

        <div slot="footer">
          <button type="button" (click)="closeModal()">Annuler</button>
          <button type="button" class="btn-primary" (click)="confirmAction()">
            Confirmer
          </button>
        </div>
      </app-modal>
    </div>
  `,
  styleUrls: ['./demo-form.component.scss']
})
export class DemoFormComponent {
  userForm: FormGroup;
  isModalOpen = false;

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      description: [''],
      category: [''],
      notifications: [false]
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      console.log('Form submitted:', this.userForm.value);
      alert('Formulaire soumis avec succès !');
    }
  }

  resetForm() {
    this.userForm.reset();
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  confirmAction() {
    alert('Action confirmée !');
    this.closeModal();
  }
}