export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentMethod = 'Card' | 'Cash' | 'Wallet';

export interface ShippingAddress {
  street: string;
  city: string;
  state?: string;
}
export interface OrderItem {
  productId: string;
  productTitle: string;
  productImg: string;
  price: number;
  quantity: number;
}
export interface Order {
  _id: string;
  userId: string;
  cartId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  paidAt?: Date | string;
  totalOrderPrice: number;
  discountAmount: number;
  finalPrice: number;
  shippingAddress: ShippingAddress;
  orderItems: OrderItem[];
  couponId?: string;

  // Tracking timestamps
  processedAt?: Date | string;
  shippedAt?: Date | string;
  deliveredAt?: Date | string;
  cancelledAt?: Date | string;
  createdAt: Date | string;
}
