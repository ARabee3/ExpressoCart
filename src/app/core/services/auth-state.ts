import { Injectable, signal, computed } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  _id: string;
  role: 'Customer' | 'Seller' | 'Admin';
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthState {
  private _token = signal<string | null>(localStorage.getItem('token'));

  token = this._token.asReadonly();

  user = computed(() => {
    const token = this._token();
    if (!token) return null;

    return jwtDecode<JwtPayload>(token);
  });

  isLoggedIn = computed(() => !!this._token());

  role = computed(() => this.user()?.role ?? null);

  setToken(token: string) {
    localStorage.setItem('token', token);
    this._token.set(token);
  }

  clear() {
    localStorage.removeItem('token');
    this._token.set(null);
  }
}
