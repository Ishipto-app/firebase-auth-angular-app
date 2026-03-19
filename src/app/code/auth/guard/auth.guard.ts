import {inject} from '@angular/core';
import {Router, CanActivateFn, ActivatedRouteSnapshot} from '@angular/router';
import {AuthService} from '../auth.service';
import {filter, map, take} from 'rxjs/operators';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    filter(user => user !== undefined), // Wait for auth state to be determined
    take(1),
    map(user => {
      if (!user) {
        router.navigate(['/login']);
        return false;
      }

      // Check for email verification if provider is password
      const isEmailPassword = user.providerData.some(p => p.providerId === 'password');
      if (isEmailPassword && !user.emailVerified) {
        router.navigate(['/user-verify']);
        return false;
      }

      const requiredRoles = route.data['roles'] as string[];
      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }

      const hasRequiredRole = requiredRoles.some(role => authService.hasRole(role));
      if (hasRequiredRole) {
        return true;
      }

      router.navigate(['/permission-denied']);
      return false;
    })
  );
};
