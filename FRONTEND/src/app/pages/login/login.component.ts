import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  template: `
    <div class="login-wrapper">
      <div class="login-container">
        <div class="login-header">
          <div class="brand-section">
            <div class="brand-icon">🚀</div>
            <h1>AdminSpace</h1>
          </div>
          <p>Accédez à l'espace d'administration</p>
        </div>
        
        <form class="login-form" [formGroup]="loginForm" (ngSubmit)="onLogin()">
          <div class="form-group">
            <label class="form-label required" for="email">Adresse email</label>
            <input 
              type="email" 
              id="email" 
              class="form-input"
              [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
              formControlName="email"
              placeholder="admin@exemple.com"
            />
            <div class="form-error" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              Email invalide
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label required" for="password">Mot de passe</label>
            <input 
              type="password" 
              id="password" 
              class="form-input"
              [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              formControlName="password"
              placeholder="••••••••"
            />
            <div class="form-error" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              Mot de passe requis
            </div>
          </div>
          
          <div class="form-group">
            <div class="form-checkbox">
              <input type="checkbox" id="remember" formControlName="remember">
              <label for="remember">Se souvenir de moi</label>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="login-btn btn-primary" [disabled]="loginForm.invalid">
              Se connecter
            </button>
            <button type="button" class="forgot-btn">
              Mot de passe oublié ?
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      console.log('Login attempt:', this.loginForm.value);
      // Redirection automatique pour la démo
      window.location.href = '/admin/dashboard';
    }
  }
}