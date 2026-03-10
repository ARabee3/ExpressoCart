import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthApi } from '../../../core/services/auth-api';
import { ToastService } from '../../../core/services/toast.service';
import { ProductService } from '../../../core/services/product.service';

interface SellerProfileUser {
  name: string;
  email: string;
  phone: string;
  storeName: string;
  isApproved: boolean;
  role: string;
}

@Component({
  selector: 'app-seller-profile',
  templateUrl: './seller-profile.html',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerProfile implements OnInit {
  private readonly authApi = inject(AuthApi);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);

  protected readonly user = signal<Partial<SellerProfileUser>>({});
  protected readonly isEditing = signal(false);
  protected readonly saving = signal(false);

  protected readonly editForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: [''],
    storeName: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit() {
    this.authApi.getMe().subscribe({
      next: (res: any) => {
        const d = res.data;
        this.user.set({
          name: d.name,
          email: d.email,
          phone: d.phone,
          storeName: d.storeName,
          isApproved: d.isApproved,
          role: d.role,
        });
      },
    });
  }

  protected getInitials(): string {
    const name = this.user().name ?? 'S';
    return name
      .split(' ')
      .slice(0, 2)
      .map((w: string) => w[0])
      .join('')
      .toUpperCase();
  }

  protected startEdit() {
    this.editForm.patchValue({
      name: this.user().name ?? '',
      phone: this.user().phone ?? '',
      storeName: this.user().storeName ?? '',
    });
    this.isEditing.set(true);
  }

  protected cancelEdit() {
    this.isEditing.set(false);
  }

  protected saveEdit() {
    if (this.editForm.invalid) return;
    this.saving.set(true);
    const { name, phone, storeName } = this.editForm.value;
    this.authApi
      .updateProfile({ name: name!, phone: phone || undefined, storeName: storeName || undefined })
      .subscribe({
        next: () => {
          this.user.update((u) => ({
            ...u,
            name: name!,
            phone: phone || u.phone,
            storeName: storeName || u.storeName,
          }));
          this.productService.clearCache();
          this.toast.success('Profile updated successfully');
          this.isEditing.set(false);
          this.saving.set(false);
        },
        error: () => {
          this.saving.set(false);
        },
      });
  }
}
