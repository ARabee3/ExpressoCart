import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthApi {
  private api = inject(ApiService);

  register(data: any) {
    return this.api.post('register', data);
  }

  login(data: any) {
    return this.api.post('login', data);
  }

  verifyEmail(data: { otp: string }): Observable<any> {
  return this.api.post('verify-email', data);
}

  forgotPassword(email: string) {
    return this.api.post('forgot-password', { email });
  }

  resetPassword(data: any) {
    return this.api.patch('reset-password', data);
  }

  refresh() {
    return this.api.post('refresh', {});
  }
}
