import { HttpInterceptorFn } from '@angular/common/http';
import { AuthState } from '../../services/auth-state';
import { inject } from '@angular/core';

export const sessionInterceptor: HttpInterceptorFn = (req, next) => {
  const authState = inject(AuthState);
  if (!req.url.includes('/cart')) return next(req);

  if (authState.isLoggedIn()) return next(req);

  const sessionId = localStorage.getItem('guest_session_id');
  // console.log(sessionId);

  //if first time to add to cart
  if (!sessionId) return next(req);

  const cloned = req.clone({
    setHeaders: { 'x-session-id': sessionId },
  });

  return next(cloned);
};
