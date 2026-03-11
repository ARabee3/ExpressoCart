import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthState } from '../../../core/services/auth-state';
import { AuthApi } from '../../../core/services/auth-api';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-pending-approval',
  templateUrl: './pending-approval.html',
})
export class PendingApproval {
  private router = inject(Router);
  private authState = inject(AuthState);
  private authApi = inject(AuthApi);
  private toast = inject(ToastService);

  checking = signal(false);

  checkStatus() {
    this.checking.set(true);
    this.authApi.getMe().subscribe({
      next: (res: any) => {
        this.checking.set(false);
        if (res?.data?.isApproved) {
          this.toast.success('Your account has been approved! Welcome to your dashboard.');
          this.router.navigate(['/seller/dashboard']);
        } else {
          this.toast.error('Your account is still pending. Please check back later.');
        }
      },
      error: () => {
        this.checking.set(false);
        this.toast.error('Could not check status. Please try again.');
      },
    });
  }

  logout() {
    this.authApi.logout().subscribe({ complete: () => {} });
    this.authState.clear();
    this.router.navigate(['/auth/login']);
  }
}
