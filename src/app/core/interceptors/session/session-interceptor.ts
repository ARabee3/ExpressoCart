import { HttpInterceptorFn } from '@angular/common/http';

export const sessionInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('/cart')) return next(req);

  //if (authService.isLoggedIn()) return next(req);

  const sessionId = localStorage.getItem('guest_session_id');

  //if first time to add to cart
  if (!sessionId) return next(req);

  const cloned = req.clone({
    setHeaders: { 'x-session-id': sessionId },
  });

  return next(cloned);
};
