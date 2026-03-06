// import { Component, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import {
//   ReactiveFormsModule,
//   FormBuilder,
//   Validators,
//   AbstractControl,
//   ValidationErrors,
//   ValidatorFn,
// } from '@angular/forms';
// import { RouterLink } from '@angular/router';
// @Component({
//   selector: 'app-register',
//   imports: [CommonModule, ReactiveFormsModule, RouterLink],
//   templateUrl: './register.html',
// })
// export class Register {
//   private fb = inject(FormBuilder);

//   registerForm = this.fb.group(
//     {
//       name: ['', [Validators.required, Validators.minLength(3)]],

//       email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)]],

//       phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],

//       password: [
//         '',
//         [
//           Validators.required,
//           Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/),
//         ],
//       ],
//       confirmPassword: ['', Validators.required],
//     },
//     {
//       validators: passwordMatchValidator,
//     },
//   );

//   onSubmit() {
//     if (this.registerForm.valid) {
//       console.log(this.registerForm.value);
//       this.registerForm.reset();
//     }
//   }

// }

// export const passwordMatchValidator: ValidatorFn = (
//   control: AbstractControl,
// ): ValidationErrors | null => {
//   const password = control.get('password')?.value;
//   const confirmPassword = control.get('confirmPassword')?.value;

//   if (!password || !confirmPassword) return null;

//   return password === confirmPassword ? null : { passwordMismatch: true };
// };
import { Component, inject, signal } from '@angular/core';
import { AuthApi } from '../../../../core/services/auth-api';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthState } from '../../../../core/services/auth-state';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VerifyOtp } from '../verify-otp/verify-otp';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, VerifyOtp],
  templateUrl: './register.html',
})
export class Register {
  private fb = inject(FormBuilder);
  private authApi = inject(AuthApi);
  private toast = inject(ToastService);
  private authState = inject(AuthState);

  loading = signal(false);
  showOtp = signal(false);
  registerForm = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/),
        ],
      ],
      confirmPassword: ['', Validators.required],
      role: ['Customer'],
    },
    { validators: passwordMatchValidator },
  );
  onSubmit() {
    if (this.registerForm.invalid) return;
    this.loading.set(true);

    const body = { ...this.registerForm.value };
    delete body.confirmPassword;

    this.authApi.register(body).subscribe({
      next: (res: any) => {
        this.toast.success('Account created. Check your email for OTP');
        if (res.token) {
          this.authState.setToken(res.token);
        }

        this.showOtp.set(true);
        this.loading.set(false);
      },

      error: () => {
        this.loading.set(false);
      },
    });
  }
}

export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (!password || !confirmPassword) return null;
  return password === confirmPassword ? null : { passwordMismatch: true };
};
