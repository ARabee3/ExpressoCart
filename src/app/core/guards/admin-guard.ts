import { inject } from '@angular/core';
import { CanActivateFn,Router } from '@angular/router';
import { AuthState } from '../services/auth-state';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthState);
  const router = inject(Router);

  if (auth.role() === 'Admin') {
    return true;
  }

  router.navigate(['/']);

  return false;
};
