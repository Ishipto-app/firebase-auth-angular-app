import {inject} from '@angular/core';
import {Router, CanActivateFn} from '@angular/router';
import {AuthService} from '../auth.service';
import {filter, map, take} from 'rxjs/operators';

export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    filter(user => user !== undefined), // Wait for auth state to be determined
    take(1),
    map(user => {
      if (user) {
        router.navigate(['/admin/workflow']);
        return false;
      }
      return true;
    })
  );
};
