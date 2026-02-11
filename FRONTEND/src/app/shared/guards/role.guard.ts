import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.currentUser$.pipe(
      map(user => {
        const isAuthenticated = authService.isAuthenticated();

        console.log('🛡️ RoleGuard check - Is authenticated:', isAuthenticated, 'User role:', user?.role, 'Allowed roles:', allowedRoles); // ✅ Debug

        if (isAuthenticated && user && user.role && allowedRoles.includes(user.role)) {
          console.log('✅ RoleGuard: Access granted for role:', user.role); // ✅ Debug
          return true;
        } else {
          console.log(`❌ RoleGuard: Access denied - User role: ${user?.role || 'none'}, Allowed roles:`, allowedRoles); // ✅ Debug
          // Redirect to landing page if not authorized
          router.navigate(['/']);
          return false;
        }
      })
    );
  };
};