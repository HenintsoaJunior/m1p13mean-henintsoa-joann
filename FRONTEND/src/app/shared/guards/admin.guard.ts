import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    map(user => {
      const isAuthenticated = authService.isAuthenticated();

      console.log('🛡️ AdminGuard check - Is authenticated:', isAuthenticated, 'User role:', user?.role); // ✅ Debug

      if (isAuthenticated && user && user.role === 'admin') {
        console.log('✅ AdminGuard: Access granted for admin role'); // ✅ Debug
        return true;
      } else {
        console.log(`❌ AdminGuard: Access denied - User role: ${user?.role || 'none'}`); // ✅ Debug
        // Redirect to landing page if not an admin
        router.navigate(['/']);
        return false;
      }
    })
  );
};