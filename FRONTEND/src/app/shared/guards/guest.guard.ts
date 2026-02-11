import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

export const guestGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    map(user => {
      if (!authService.isAuthenticated()) {
        return true;
      } else {
        // If user is authenticated, redirect to their appropriate dashboard
        if (user && user.role) {
          switch(user.role) {
            case 'admin':
              router.navigate(['/admin/dashboard']);
              break;
            case 'boutique':
              router.navigate(['/boutique']);
              break;
            case 'client':
              router.navigate(['/client']);
              break;
            default:
              router.navigate(['/']);
              break;
          }
        } else {
          router.navigate(['/']);
        }
        return false;
      }
    })
  );
};