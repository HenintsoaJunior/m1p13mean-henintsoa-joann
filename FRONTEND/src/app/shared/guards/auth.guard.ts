import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    map(isAuthenticated => {
      const realAuthState = authService.isAuthenticated();

      console.log('🛡️ AuthGuard check - Observable:', isAuthenticated, 'Real state:', realAuthState); // ✅ Debug

      if (isAuthenticated && realAuthState) {
        console.log('✅ AuthGuard: Access granted'); // ✅ Debug
        return true;
      } else {
        console.log('❌ AuthGuard: Access denied, redirecting to login'); // ✅ Debug
        router.navigate(['/login']);
        return false;
      }
    })
  );
};