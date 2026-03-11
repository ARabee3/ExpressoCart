import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from '../services/auth-state';
import { AuthApi } from '../services/auth-api';
import { map, catchError, of } from 'rxjs';

export const sellerGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthState);
  const router = inject(Router);
  const authApi = inject(AuthApi);

  if (auth.role() !== 'Seller') {
    router.navigate(['/']);
    return false;
  }

  return authApi.getMe().pipe(
    map((res: any) => {
      if (res?.data?.isApproved) {
        return true;
      }
      router.navigate(['/seller/pending']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/']);
      return of(false);
    }),
  );
};
