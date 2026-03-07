import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { AdminStats } from '../../core/models/admin-stats.model';
import { Coupon, CreateCouponDTO } from '../../core/models/coupon.model';
import { Category, CategoriesResponse } from '../../core/models/category.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = inject(ApiService);

  // -- Dashboard
  stats = signal<AdminStats | null>(null);

  loadDashboardStats() {
    this.api.get<{ data: AdminStats }>('admin/dashboard-stats').subscribe((response) => {
      this.stats.set(response.data);
    });
  }

  // -- Coupons
  coupons = signal<Coupon[] | null>(null);

  loadCoupons() {
    this.api.get<{ data: Coupon[] }>('admin/coupons').subscribe((response) => {
      this.coupons.set(response.data);
    });
  }

  createCoupon(newCoupon: CreateCouponDTO) {
    this.api.post<{ data: Coupon }>('admin/coupons', newCoupon).subscribe({
      next: (response) => {
        const current = this.coupons() || [];
        this.coupons.set([...current, response.data]);
      },
    });
  }

  updateCoupon(id: string, updatedData: Partial<Coupon>) {
    this.api.put<{ data: Coupon }>(`admin/coupons/${id}`, updatedData).subscribe({
      next: (response) => {
        const current = this.coupons() || [];
        this.coupons.set(current.map((c) => (c._id === id ? response.data : c)));
      },
    });
  }

  deleteCoupon(id: string) {
    this.api.delete<{ data: Coupon }>(`admin/coupons/${id}`).subscribe({
      next: () => {
        this.coupons.update((currentCoupons) =>
          currentCoupons ? currentCoupons.filter((c) => c._id !== id) : [],
        );
      },
    });
  }

  // -- Categories
  categories = signal<Category[] | null>(null);

  loadCategories() {
    this.api.get<CategoriesResponse>('categories').subscribe((response) => {
      this.categories.set(response.data);
    });
  }

  createCategory(body: { name: string }) {
    this.api.post<{ status: string; data: Category }>('categories', body).subscribe({
      next: (response) => {
        const current = this.categories() || [];
        this.categories.set([...current, response.data]);
      },
    });
  }

  updateCategory(id: string, body: { name: string }) {
    this.api.put<{ status: string; data: Category }>(`categories/${id}`, body).subscribe({
      next: (response) => {
        const current = this.categories() || [];
        this.categories.set(current.map((c) => (c._id === id ? response.data : c)));
      },
    });
  }

  deleteCategory(id: string) {
    this.api.delete<{ status: string; message: string }>(`categories/${id}`).subscribe({
      next: () => {
        this.categories.update((cats) => (cats ? cats.filter((c) => c._id !== id) : []));
      },
    });
  }
}
