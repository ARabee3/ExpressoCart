import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthState } from '../services/auth-state';
import { AuthApi } from '../services/auth-api';
import { map, catchError, of } from 'rxjs';

// Prevents /seller/pending from being caught by the SellerLayout route,
// so it falls through to the public layout (avoids an approval-redirect loop).
export const sellerMatchGuard: CanMatchFn = (_route, segments) => {
  if (segments.length >= 2 && segments[1].path === 'pending') {
    return false;
  }
  return inject(AuthState).role() === 'Seller';
};

export const sellerGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthState);
  const router = inject(Router);
  const authApi = inject(AuthApi);

  if (auth.role() !== 'Seller') {
    router.navigate(['/unauthorized']);
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
