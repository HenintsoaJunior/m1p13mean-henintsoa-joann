import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

export const guestGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    map(isAuthenticated => {
      if (!isAuthenticated) {
        return true;
      } else {
        router.navigate(['/admin/dashboard']);
        return false;
      }
    })
  );
};