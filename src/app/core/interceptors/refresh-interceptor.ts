import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthApi } from '../services/auth-api';
import { AuthState } from '../services/auth-state';
import { Router } from '@angular/router';

let isRefreshing = false;
// null = not started, '' = failed (sentinel), any string = new token
let refreshTokens = new BehaviorSubject<string | null>(null);

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authApi = inject(AuthApi);
  const authState = inject(AuthState);
  const router = inject(Router);

  const isAuthPath =
    req.url.includes('login') ||
    req.url.includes('forgot-password') ||
    req.url.includes('reset-password') ||
    req.url.includes('register') ||
    req.url.includes('verify-email') ||
    req.url.includes('logout');

  return next(req).pipe(
    catchError((error) => {
      // Only attempt token refresh if the user is actually logged in (has a token).
      // Guests have no token so a 401 should pass through silently — no redirect.
      const hasToken = !!authState.token();

      if (error.status === 401 && !req.url.includes('refresh') && !isAuthPath && hasToken) {
        // ── If already refreshing, WAIT for new token then retry
        if (isRefreshing) {
          return refreshTokens.pipe(
            // pass through both success tokens AND the failure sentinel ('')
            filter((token) => token !== null),
            take(1),
            switchMap((token) => {
              // Empty string is a failure sentinel — propagate as error
              if (!token) return throwError(() => error);
              return next(
                req.clone({
                  setHeaders: { Authorization: `Bearer ${token}` },
                }),
              );
            }),
          );
        }
        // ── Start refreshing
        isRefreshing = true;
        refreshTokens.next(null); // block other requests

        return authApi.refresh().pipe(
          switchMap((res: any) => {
            const newToken = res.data;
            authState.setToken(newToken);
            isRefreshing = false;
            refreshTokens.next(newToken); // unblock waiting requests

            // retry original request with new token
            return next(
              req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` },
              }),
            );
          }),

          catchError((refreshErr) => {
            isRefreshing = false;
            // Emit empty string sentinel so queued requests unblock with an error
            refreshTokens.next('');
            // Reset back to null for next cycle
            refreshTokens.next(null);
            authState.clear();
            router.navigate(['/auth/login']);
            return throwError(() => refreshErr);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
