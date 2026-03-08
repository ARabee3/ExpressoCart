import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthApi } from '../../../../core/services/auth-api';
import { ToastService } from '../../../../core/services/toast.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forget-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forget-password.html',
})
export class ForgetPassword {
  private fb = inject(FormBuilder);
  private auhtApi = inject(AuthApi);
  private toast = inject(ToastService);
  private router = inject(Router);

  loading = signal(false);
  showResetForm = signal(false);

  emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  resetForm = this.fb.group({
    otp: ['', [Validators.required]],
    newPassword: [
      '',
      [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/),
      ],
    ],
  });

  sendOtp() {
    if (this.emailForm.invalid) return;
    this.loading.set(true);
    this.auhtApi.forgetPassword(this.emailForm.value.email!).subscribe({
      next: () => {
        this.toast.success('OTP sent to your email');
        this.showResetForm.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
      },
    });
  }

  submitReset() {
    if (this.resetForm.invalid) return;
    this.loading.set(true);

    const body = {
      email: this.emailForm.value.email,
      otp: this.resetForm.value.otp,
      newPassword: this.resetForm.value.newPassword,
    };

    this.auhtApi.resetPassword(body).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Password changed successfully');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading.set(false);
        this.resetForm.get('otp')?.reset();
      },
    });
  }
}
