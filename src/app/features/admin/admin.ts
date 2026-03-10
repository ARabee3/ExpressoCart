import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { AdminStats } from '../../core/models/admin-stats.model';
import { Coupon, CreateCouponDTO } from '../../core/models/coupon.model';
import { Category, CategoriesResponse } from '../../core/models/category.model';
import { User, UserRole } from '../../core/models/user.model';
import { Order, OrderStatus } from '../../core/models/order.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = inject(ApiService);

  // -- Dashboard
  stats = signal<AdminStats | null>(null);
  recentOrders = signal<Order[] | null>(null);

  loadDashboardStats() {
    this.api.get<{ data: AdminStats }>('admin/dashboard-stats').subscribe((response) => {
      this.stats.set(response.data);
    });
  }

  loadRecentOrders() {
    this.api
      .get<{ message: string; data: Order[]; countOfOrders: number }>('admin/orders', {
        page: 1,
        limit: 10,
      })
      .subscribe((response) => {
        this.recentOrders.set(response.data);
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

  // -- Users
  users = signal<User[] | null>(null);
  selectedUserOrders = signal<Order[] | null>(null);
  selectedUser = signal<User | null>(null);
  usersTotalCount = signal(0);
  usersCurrentPage = signal(1);
  usersTotalPages = signal(1);
  usersPerPage = 10;

  loadUsers(page = 1) {
    this.users.set(null); // show loading state
    this.api
      .get<{
        message: string;
        data: User[];
        totalUsers?: number;
        currentPage?: number;
        totalPages?: number;
      }>('admin/users', { page, limit: this.usersPerPage })
      .subscribe((response) => {
        this.users.set(response.data);
        if (response.totalUsers != null) this.usersTotalCount.set(response.totalUsers);
        if (response.currentPage != null) this.usersCurrentPage.set(response.currentPage);
        if (response.totalPages != null) this.usersTotalPages.set(response.totalPages);
      });
  }

  getUser(id: string) {
    this.api.get<{ message: string; data: User }>(`admin/users/${id}`).subscribe((response) => {
      this.selectedUser.set(response.data);
    });
  }

  deleteUser(id: string) {
    this.api.delete<{ message: string; data: User }>(`admin/users/${id}`).subscribe({
      next: (response) => {
        // Soft-delete: update user in list with isDeleted: true from response
        this.users.update((users) =>
          users ? users.map((u) => (u._id === id ? response.data : u)) : [],
        );
      },
    });
  }

  restoreUser(id: string) {
    this.api
      .patch<{ message: string; data: User }>(`admin/users/${id}/restore`, { isDeleted: false })
      .subscribe({
        next: (response) => {
          this.users.update((users) =>
            users ? users.map((u) => (u._id === id ? response.data : u)) : [],
          );
        },
      });
  }

  updateUserRole(id: string, role: UserRole) {
    this.api.put<{ message: string; data: User }>(`admin/users/${id}/role`, { role }).subscribe({
      next: (response) => {
        this.users.update((users) =>
          users ? users.map((u) => (u._id === id ? response.data : u)) : [],
        );
      },
    });
  }

  loadUserOrders(userId: string) {
    this.selectedUserOrders.set(null);
    this.api
      .get<{ message: string; data: Order[] }>(`admin/orders/user/${userId}`)
      .subscribe((response) => {
        this.selectedUserOrders.set(response.data);
      });
  }

  // -- Orders (admin management)
  orders = signal<Order[] | null>(null);
  ordersTotalCount = signal(0);
  ordersCurrentPage = signal(1);
  ordersTotalPages = signal(1);
  ordersPerPage = 10;
  selectedOrder = signal<Order | null>(null);

  loadOrders(page = 1) {
    this.orders.set(null);
    this.api
      .get<{
        message: string;
        data: Order[];
        countOfOrders: number;
        currentPage: number;
        totalPages: number;
      }>('admin/orders', { page, limit: this.ordersPerPage })
      .subscribe((response) => {
        this.orders.set(response.data);
        this.ordersTotalCount.set(response.countOfOrders);
        this.ordersCurrentPage.set(response.currentPage);
        this.ordersTotalPages.set(response.totalPages);
      });
  }

  getOrder(id: string) {
    this.selectedOrder.set(null);
    this.api.get<{ message: string; data: Order }>(`admin/orders/${id}`).subscribe((response) => {
      this.selectedOrder.set(response.data);
    });
  }

  updateOrderStatus(id: string, status: OrderStatus) {
    this.api
      .put<{ message: string; data: Order }>(`admin/orders/${id}/status`, { status })
      .subscribe({
        next: (response) => {
          this.orders.update((orders) =>
            orders ? orders.map((o) => (o._id === id ? response.data : o)) : [],
          );
          // Also update selectedOrder if viewing this one
          if (this.selectedOrder()?._id === id) {
            this.selectedOrder.set(response.data);
          }
        },
      });
  }

  deleteOrder(id: string) {
    this.api.delete<{ message: string; data: Order }>(`admin/orders/${id}`).subscribe({
      next: () => {
        this.orders.update((orders) => (orders ? orders.filter((o) => o._id !== id) : []));
        this.ordersTotalCount.update((c) => Math.max(0, c - 1));
      },
    });
  }

  // -- Sellers
  sellers = signal<User[] | null>(null);

  loadSellers() {
    this.sellers.set(null);
    this.api.get<{ message: string; data: User[] }>('admin/sellers').subscribe((response) => {
      this.sellers.set(response.data);
    });
  }

  approveSeller(id: string) {
    this.api.put<{ message: string; data: User }>(`admin/sellers/${id}/approve`, {}).subscribe({
      next: (response) => {
        this.sellers.update((sellers) =>
          sellers ? sellers.map((s) => (s._id === id ? response.data : s)) : [],
        );
      },
    });
  }

  suspendSeller(id: string) {
    this.api.put<{ message: string; data: User }>(`admin/sellers/${id}/suspend`, {}).subscribe({
      next: (response) => {
        this.sellers.update((sellers) =>
          sellers ? sellers.map((s) => (s._id === id ? response.data : s)) : [],
        );
      },
    });
  }

  reactivateSeller(id: string) {
    this.api.put<{ message: string; data: User }>(`admin/sellers/${id}/reactivate`, {}).subscribe({
      next: (response) => {
        this.sellers.update((sellers) =>
          sellers ? sellers.map((s) => (s._id === id ? response.data : s)) : [],
        );
      },
    });
  }
}
