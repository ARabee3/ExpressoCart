import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthApi } from '../../../../core/services/auth-api';
import { ToastService } from '../../../../core/services/toast.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-verify-otp',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './verify-otp.html',
})
export class VerifyOtp {
  private fb = inject(FormBuilder);
  private authApi = inject(AuthApi);
  private toast = inject(ToastService);
  private router = inject(Router);

  form = this.fb.group({
    otp: ['', Validators.required]
  });
  submit() {

    if (this.form.invalid) return;

    const body ={ otp: this.form.value.otp! };

    this.authApi.verifyEmail(body).subscribe({

      next: (res: any) => {
        this.toast.success('Email verified successfully');
        this.router.navigate(['/login']);
      },
      error: (err) => {
      this.toast.error(err.error?.message || 'Verification failed');
    }

    });
  }
}
