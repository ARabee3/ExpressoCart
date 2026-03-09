import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import {
  Coupon as CouponModel,
  CreateCouponDTO,
  DiscountType,
} from '../../../core/models/coupon.model';
import { AdminService } from '../admin';

@Component({
  selector: 'app-coupon',
  imports: [FormsModule, DatePipe],
  templateUrl: './coupon.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Coupon implements OnInit {
  admin = inject(AdminService);

  // UI state
  showForm = signal(false);
  editingCoupon = signal<CouponModel | null>(null);
  deletingCoupon = signal<CouponModel | null>(null);

  // today in YYYY-MM-DD for the date input min attribute
  readonly today = new Date().toISOString().split('T')[0];

  // Form model
  form: CreateCouponDTO = this.emptyForm();

  // Client-side pagination
  readonly itemsPerPage = 10;
  currentPage = signal(1);

  totalCoupons = computed(() => (this.admin.coupons() ?? []).length);

  totalPages = computed(() => Math.max(1, Math.ceil(this.totalCoupons() / this.itemsPerPage)));

  paginatedCoupons = computed(() => {
    const coupons = this.admin.coupons() ?? [];
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return coupons.slice(start, start + this.itemsPerPage);
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    let start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.currentPage.set(page);
  }

  ngOnInit(): void {
    this.admin.loadCoupons();
  }

  openCreate() {
    this.editingCoupon.set(null);
    this.form = this.emptyForm();
    this.showForm.set(true);
  }

  openEdit(coupon: CouponModel) {
    this.editingCoupon.set(coupon);
    this.form = {
      code: coupon.code,
      discountType: coupon.discountType,
      discount: coupon.discount,
      expireDate: coupon.expireDate,
      usageLimit: coupon.usageLimit,

      isActive: coupon.isActive,
    };
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  submit() {
    const editing = this.editingCoupon();
    if (editing) {
      this.admin.updateCoupon(editing._id, this.form);
    } else {
      this.admin.createCoupon(this.form);
    }
    this.closeForm();
  }

  confirmDelete(coupon: CouponModel) {
    this.deletingCoupon.set(coupon);
  }

  deleteConfirmed() {
    const coupon = this.deletingCoupon();
    if (coupon) {
      this.admin.deleteCoupon(coupon._id);
      this.deletingCoupon.set(null);
    }
  }

  private emptyForm(): CreateCouponDTO {
    return {
      code: '',
      discountType: 'percentage' as DiscountType,
      discount: 0,
      expireDate: new Date(),
      usageLimit: 1,
      isActive: true,
    };
  }
}
