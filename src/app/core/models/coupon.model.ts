export type DiscountType = 'percentage' | 'fixed';

export interface Coupon {
  _id: string;
  code: string;
  discountType: DiscountType;
  discount: number;
  expireDate: Date;
  usageLimit: number;
  usedCount?: number;
  isActive?: boolean;
}

export type CreateCouponDTO = Omit<Coupon, '_id' | 'usedCount'>;
