import { Component, inject, signal, OnInit, NgZone } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthApi } from '../../../../core/services/auth-api';
import { AuthState } from '../../../../core/services/auth-state';
import { ToastService } from '../../../../core/services/toast.service';
import { CommonModule } from '@angular/common';

declare const google: any;
@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private authApi = inject(AuthApi);
  private authState = inject(AuthState);
  private toast = inject(ToastService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  loading = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)]],

    password: ['', Validators.required],
  });

  ngOnInit() {
    this.initGoogleSignIn();
  }
  initGoogleSignIn() {
    const interval = setInterval(() => {
      if (typeof google !== 'undefined' && google.accounts) {
        clearInterval(interval);
        google.accounts.id.initialize({
          client_id: '963333033864-c2827dskcqla541vo4ldqeo74dtb7cs2.apps.googleusercontent.com',
          callback: (response: any) => {
            this.ngZone.run(() => {
              this.loginWithGoogle(response.credential);
            });
          },
        });
        google.accounts.id.renderButton(document.getElementById('google-btn'), {
          type: 'standard',
          size: 'large',
          text: 'signin_with',
          width: 380,
        });
      }
    }, 100);
  }

  loginWithGoogle(idToken: string) {
    this.loading.set(true);
    const sessionId = localStorage.getItem('guest_session_id');

    this.authApi.googleLogin(idToken, sessionId).subscribe({
      next: (res: any) => {
        const token = res.data || res.token;
        this.authState.setToken(token);

        const role = this.authState.role();
        // Block Admins and Sellers from using Google Sign-In
        if (role === 'Admin') {
          this.authState.clear();
          this.toast.error('Please use email and password to sign in.');
          this.loading.set(false);
          return;
        }
        localStorage.removeItem('guest_session_id');
        this.toast.success('Login successful');
        //navigate base role
        if (role === 'Seller') {
          this.authApi.getMe().subscribe({
            next: (meRes: any) => {
              if (meRes?.data?.isApproved) {
                this.router.navigate(['/seller/dashboard']);
              } else {
                this.router.navigate(['/seller/pending']);
              }
              this.loading.set(false);
            },
            error: () => {
              this.router.navigate(['/seller/pending']);
              this.loading.set(false);
            },
          });
        } else if (role === 'Customer') {
          this.router.navigate(['/']);
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('Google Login Error:', err);
        this.toast.error('Google sign-in failed. Please try again.');
        this.loading.set(false);
      },
    });
  }

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

        // Role-based redirect
        const role = this.authState.role();
        if (role === 'Admin') {
          this.router.navigate(['/admin/dashboard']);
          this.loading.set(false);
        } else if (role === 'Seller') {
          this.authApi.getMe().subscribe({
            next: (meRes: any) => {
              if (meRes?.data?.isApproved) {
                this.router.navigate(['/seller/dashboard']);
              } else {
                this.router.navigate(['/seller/pending']);
              }
              this.loading.set(false);
            },
            error: () => {
              this.router.navigate(['/seller/pending']);
              this.loading.set(false);
            },
          });
        } else {
          this.router.navigate(['/']);
          this.loading.set(false);
        }
      },

      error: (err) => {
        console.log(err);

        this.loading.set(false);
        if (err.error?.error === 'Please Confirm Your Email First') {
          this.router.navigate(['/auth/verify-otp'], {
            state: { email: this.loginForm.value.email },
          });
        }
      },
    });
  }
}
