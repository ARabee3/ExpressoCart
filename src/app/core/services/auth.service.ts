import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly router = inject(Router);

  private readonly _isLoggedIn = signal(
    typeof localStorage !== 'undefined' && !!localStorage.getItem(this.TOKEN_KEY),
  );
  readonly isLoggedIn = this._isLoggedIn.asReadonly();

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this._isLoggedIn.set(true);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this._isLoggedIn.set(false);
    this.router.navigate(['/']);
  }
}
