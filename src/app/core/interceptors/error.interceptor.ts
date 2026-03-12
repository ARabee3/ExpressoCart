import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthState } from '../services/auth-state';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const authState = inject(AuthState);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Guests (no token) hitting a 401 — suppress toast, let it pass silently.
      // The refresh interceptor won't redirect them either.
      if (error.status === 401 && !authState.token()) {
        return throwError(() => error);
      }

      let errorMessage = 'An unknown error occurred.';

      if (error.error && error.error.error) {
        errorMessage = error.error.error;
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }

      console.error('GLOBAL ERROR CAUGHT:', errorMessage);

      // Unverified account errors are handled at the component level — skip global toast
      const lower = errorMessage.toLowerCase();
      const isUnverifiedError =
        lower.includes('verif') ||
        lower.includes('activat') ||
        lower.includes('not active') ||
        lower.includes('confirm');

      if (!isUnverifiedError) {
        toast.error(errorMessage);
      }

      return throwError(() => error);
    }),
  );
};
