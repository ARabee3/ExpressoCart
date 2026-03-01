import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred!';

      // Check if the error comes from your Node.js AppError structure
      if (error.error && error.error.error) {
        // This catches: { message: "Error", error: "Your custom message" }
        errorMessage = error.error.error;
      } else if (error.error && error.error.message) {
        // This catches: { success: false, message: "User not found" }
        errorMessage = error.error.message;
      }

      // TODO: Replace this standard alert with a nice UI Toast/Snackbar library later!
      // (e.g., ToastrService.error(errorMessage))
      console.error('GLOBAL ERROR CAUGHT:', errorMessage);
      alert(`ExpressoCart Error: ${errorMessage}`);

      // Pass the error back to the component just in case it needs to do something specific
      return throwError(() => error);
    }),
  );
};
