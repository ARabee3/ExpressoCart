import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
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
