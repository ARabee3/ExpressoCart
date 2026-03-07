import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthApi } from '../../../../core/services/auth-api';
import { AuthState } from '../../../../core/services/auth-state';
import { ToastService } from '../../../../core/services/toast.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  private authApi = inject(AuthApi);
  private authState = inject(AuthState);
  private toast = inject(ToastService);
  private router = inject(Router);

  loading = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)]],

    password: ['', Validators.required],
  });

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading.set(true);

    //save form data in loginData
    const loginData: any = { ...this.loginForm.value };
    // get guest session id from local storage
    const sessionId = localStorage.getItem('guest_session_id');

    if (sessionId) {
      loginData.sessionId = sessionId;
    }

    this.authApi.login(loginData).subscribe({
      next: (res: any) => {
        this.authState.setToken(res.data);

        // remove guest session id after successful login
        localStorage.removeItem('guest_session_id');

        this.toast.success('Login successful');
        this.router.navigate(['/']);
        this.loading.set(false);
      },

      error: () => {
        this.loading.set(false);
      },
    });
  }
}
