import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastService = inject(ToastService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur inattendue s\'est produite';

      if (error.status === 401) {
        // Token expiré ou invalide
        authService.logout();
        router.navigate(['/']);
        toastService.showError('Session expirée, veuillez vous reconnecter');
        return throwError(() => error);
      } else if (error.status === 403) {
        // Accès non autorisé - vérifier si l'utilisateur est connecté
        if (req.url.includes('/api/admin/')) {
          authService.logout();
          router.navigate(['/']);
          toastService.showError('Accès non autorisé, veuillez vous connecter');
          return throwError(() => error);
        }
        errorMessage = 'Accès non autorisé';
      } else if (error.status === 404) {
        errorMessage = 'Ressource non trouvée';
      } else if (error.status === 422) {
        errorMessage = 'Données de validation incorrectes';
      } else if (error.status === 500) {
        errorMessage = 'Erreur interne du serveur';
      } else if (error.status === 0) {
        errorMessage = 'Impossible de se connecter au serveur';
      }

      // Ne pas afficher de toast pour les routes d'auth car elles gèrent leurs propres erreurs
      const isAuthRoute = req.url.includes('/auth/');
      if (!isAuthRoute) {
        toastService.showError(errorMessage);
      }

      return throwError(() => error);
    })
  );
};