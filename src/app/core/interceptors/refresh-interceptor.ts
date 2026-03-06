import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthApi } from '../services/auth-api';
import { AuthState } from '../services/auth-state';
import { Router } from '@angular/router';

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authApi = inject(AuthApi);
  const authState = inject(AuthState);
  const router = inject(Router);
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 && !req.url.includes('refresh')) {
        return authApi.refresh().pipe(
          switchMap((res: any) => {
            const newToken = res.data;
            authState.setToken(newToken);

            const newReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
            });

            return next(newReq);
          }),
          catchError((refreshErr) => {
            authState.clear();
            router.navigate(['/login']);
            return throwError(() => refreshErr);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
