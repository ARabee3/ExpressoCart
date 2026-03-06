import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from '../services/auth-state';


export const sellerGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthState);
  const router = inject(Router);

  if (auth.role() === 'Seller') {
    return true;
  }

  router.navigate(['/']);

  return false;
};
