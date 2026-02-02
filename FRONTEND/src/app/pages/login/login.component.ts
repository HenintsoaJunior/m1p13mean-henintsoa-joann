import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { LoginRequest } from '../../shared/interfaces/auth.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false],
    });

    this.authService.isAuthenticated$.subscribe((isAuth) => {
      console.log('🔍 Auth state changed:', isAuth);
      if (isAuth) {
        console.log('✅ Already authenticated, redirecting to dashboard');
        this.router.navigate(['/admin/dashboard']);
      }
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const loginData: LoginRequest = {
        email: this.loginForm.value.email,
        mot_de_passe: this.loginForm.value.password,
      };

      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.token) {
            this.router.navigate(['/admin/dashboard']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || "Une erreur s'est produite lors de la connexion";
          this.toastService.showError(this.errorMessage);
          console.error('Login error:', error);
        },
      });
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
