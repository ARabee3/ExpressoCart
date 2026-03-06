import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from '../services/auth-state';
import { ToastService } from '../services/toast.service';

export const authGuard: CanActivateFn = () => {

  const authState = inject(AuthState);
  const router = inject(Router);
  const toast = inject(ToastService);
  
  if (authState.isLoggedIn()) {
    return true;
  }

  toast.warning('Please login first');

  router.navigate(['/login']);

  return false;
};
