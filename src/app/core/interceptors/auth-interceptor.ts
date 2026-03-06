import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthState } from '../services/auth-state';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authState = inject(AuthState);

  const token = authState.token();

  if (token) {

    const newReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(newReq);
  }
  return next(req);
};
