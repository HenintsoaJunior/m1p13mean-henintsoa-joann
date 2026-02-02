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
  templateUrl: './demo-form.component.html',
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