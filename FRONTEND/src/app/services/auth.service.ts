import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  ApiError,
} from '../shared/interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getToken();
    const user = this.getStoredUser();

    if (token && user && !this.isTokenExpired(token)) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    } else {
      this.clearStorage();
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/connexion`, credentials).pipe(
      tap((response) => {
        if (response.token && response.utilisateur) {
          this.setToken(response.token);
          this.setUser(response.utilisateur);
          this.currentUserSubject.next(response.utilisateur);
          this.isAuthenticatedSubject.next(true);
          this.toastService.showSuccess(`Bienvenue ${response.utilisateur.nom} !`);
        }
      }),
      catchError(this.handleError),
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    const { confirmPassword, ...backendData } = userData;
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/inscription`, backendData).pipe(
      tap((response) => {
        if (response.utilisateur) {
          console.log('✅ Inscription réussie pour:', response.utilisateur.email);
        }
      }),
      catchError(this.handleError),
    );
  }

  logout(): void {
    this.clearStorage();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.toastService.showInfo('Déconnexion réussie');
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.checkAuthenticationState();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private checkAuthenticationState(): boolean {
    const token = this.getToken();
    const user = this.getStoredUser();
    const isValid = !!token && !!user && !this.isTokenExpired(token);

    if (isValid && !this.isAuthenticatedSubject.value) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    } else if (!isValid && this.isAuthenticatedSubject.value) {
      this.clearStorage();
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
    }

    return isValid;
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  private clearStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = "Une erreur inattendue s'est produite";

    if (error.error?.erreur) {
      errorMessage = error.error.erreur;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'Impossible de se connecter au serveur';
    } else if (error.status === 401) {
      errorMessage = 'Email ou mot de passe incorrect';
    } else if (error.status === 400) {
      errorMessage = 'Données invalides';
    } else if (error.status === 422) {
      errorMessage = 'Données de validation incorrectes';
    }

    return throwError(() => ({
      ...error.error,
      message: errorMessage,
      details: error.error?.details,
    }));
  }
}
