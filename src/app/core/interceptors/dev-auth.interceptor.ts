import { HttpInterceptorFn } from '@angular/common/http';

// ---------------------------------------------------------------
// TEMPORARY DEV INTERCEPTOR — remove once auth interceptor is done
// 1. Login via Postman or the app's /login endpoint
// 2. Copy the access_token from the response
// 3. Paste it below
// ---------------------------------------------------------------
const DEV_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OTljMjYyN2MzN2Y1YTg0MjMwZTkwNTkiLCJlbWFpbCI6ImFyYWJlZWFpaTA0MDRAZ21haWwuY29tIiwicm9sZSI6IkFkbWluIiwiaXNEZWxldGVkIjpmYWxzZSwiaWF0IjoxNzcyNzQ5MDEzLCJleHAiOjE3NzI3NTA4MTN9.QQ80f90YW-ylE0mTCkV0EsNLnCM69C2fC9m30lk6tIQ';

export const devAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('/admin')) {
    return next(req);
  }

  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${DEV_TOKEN}` },
  });

  return next(cloned);
};
