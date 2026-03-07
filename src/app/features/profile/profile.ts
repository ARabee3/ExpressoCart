import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AuthApi } from '../../core/services/auth-api';
import { AuthState } from '../../core/services/auth-state';
import { ToastService } from '../../core/services/toast.service';
import { VerifyOtp } from '../auth/pages/verify-otp/verify-otp';

interface ProfileUser {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  storeName?: string;
  isApproved?: boolean;
  isVerified?: boolean;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  imports: [RouterLink, ReactiveFormsModule, VerifyOtp],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile implements OnInit {
  private readonly authApi = inject(AuthApi);
  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly user = signal<ProfileUser>({});
  protected readonly isEditing = signal(false);
  protected readonly saving = signal(false);

  // Become a Seller modal
  protected readonly verifyingAccount = signal(false);
  protected readonly showOtpModal = signal(false);
  protected readonly otpModalVisible = signal(false);
  protected readonly showSellerModal = signal(false);
  protected readonly sellerModalVisible = signal(false);
  protected readonly sellerSubmitting = signal(false);
  protected readonly storeNameControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
  ]);

  protected readonly editForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: [''],
  });

  ngOnInit() {
    this.authApi.getMe().subscribe({
      next: (res: any) => {
        this.user.set({
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone,
          role: res.data.role,
          storeName: res.data.storeName,
          isApproved: res.data.isApproved,
          isVerified: res.data.isVerified,
        });
      },
    });
  }

  protected getInitials(): string {
    const name = this.user().name ?? 'U';
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  protected startEdit() {
    this.editForm.patchValue({
      name: this.user().name ?? '',
      phone: this.user().phone ?? '',
    });
    this.isEditing.set(true);
  }

  protected cancelEdit() {
    this.isEditing.set(false);
  }

  protected saveEdit() {
    if (this.editForm.invalid) return;
    this.saving.set(true);
    const { name, phone } = this.editForm.value;
    this.authApi.updateProfile({ name: name!, phone: phone || undefined }).subscribe({
      next: () => {
        this.user.update((u) => ({ ...u, name: name!, phone: phone || u.phone }));
        this.toast.success('Profile updated successfully');
        this.isEditing.set(false);
        this.saving.set(false);
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  // Become a Seller modal methods
  protected openSellerModal() {
    this.storeNameControl.reset();
    this.showSellerModal.set(true);
    // Small delay to trigger CSS transition
    setTimeout(() => this.sellerModalVisible.set(true), 10);
  }

  protected closeSellerModal() {
    this.sellerModalVisible.set(false);
    setTimeout(() => this.showSellerModal.set(false), 300);
  }

  protected submitSellerRequest() {
    if (this.storeNameControl.invalid) {
      this.storeNameControl.markAsTouched();
      return;
    }
    this.sellerSubmitting.set(true);
    const storeName = this.storeNameControl.value!.trim();
    this.authApi.registerAsSeller(storeName).subscribe({
      next: () => {
        this.sellerSubmitting.set(false);
        this.closeSellerModal();
        this.toast.success('Seller request submitted! Please log back in.');
        setTimeout(() => {
          this.authState.clear();
          this.router.navigate(['/auth/login']);
        }, 1500);
      },
      error: () => {
        this.sellerSubmitting.set(false);
      },
    });
  }

  protected requestVerification() {
    const email = this.user().email;
    if (!email) return;
    this.verifyingAccount.set(true);
    this.authApi.resendVerification(email).subscribe({
      next: () => {
        this.toast.success('Verification email sent! Check your inbox.');
        this.verifyingAccount.set(false);
        this.showOtpModal.set(true);
        setTimeout(() => this.otpModalVisible.set(true), 10);
      },
      error: () => {
        this.verifyingAccount.set(false);
      },
    });
  }

  protected closeOtpModal() {
    this.otpModalVisible.set(false);
    setTimeout(() => this.showOtpModal.set(false), 300);
  }

  logout() {
    this.authState.clear();
    this.router.navigate(['/auth/login']);
  }
}
