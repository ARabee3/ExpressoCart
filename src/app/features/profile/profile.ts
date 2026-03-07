import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthApi } from '../../core/services/auth-api';
import { AuthState } from '../../core/services/auth-state';
import { ToastService } from '../../core/services/toast.service';

interface ProfileUser {
  name?: string;
  email?: string;
  phone?: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  imports: [RouterLink, ReactiveFormsModule],
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

  logout() {
    this.authState.clear();
    this.router.navigate(['/']);
  }
}
