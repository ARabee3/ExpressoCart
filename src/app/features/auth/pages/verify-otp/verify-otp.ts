import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthApi } from '../../../../core/services/auth-api';
import { AuthState } from '../../../../core/services/auth-state';
import { ToastService } from '../../../../core/services/toast.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-verify-otp',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './verify-otp.html',
})
export class VerifyOtp {
  private fb = inject(FormBuilder);
  private authApi = inject(AuthApi);
  private authState = inject(AuthState);
  private toast = inject(ToastService);
  private router = inject(Router);

  email: string | null = this.router.getCurrentNavigation()?.extras.state?.['email'] ?? null;
  resendLoading = signal(false);

  private get resolvedEmail(): string | null {
    return this.email ?? this.authState.user()?.email ?? null;
  }

  form = this.fb.group({
    otp: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid) return;

    const body: { otp: string; email?: string } = { otp: this.form.value.otp! };
    if (this.resolvedEmail) body.email = this.resolvedEmail;

    this.authApi.verifyEmail(body).subscribe({
      next: (res: any) => {
        this.toast.success('Email verified successfully');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Verification failed');
      },
    });
  }

  resendOtp() {
    if (!this.email) return;
    this.resendLoading.set(true);
    this.authApi.resendVerification(this.email).subscribe({
      next: () => {
        this.toast.success('Verification email resent');
        this.resendLoading.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to resend OTP');
        this.resendLoading.set(false);
      },
    });
  }
}
