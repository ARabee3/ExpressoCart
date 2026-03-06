export interface Product {
  _id: string;
  name: string;
  slug?: string;
  price: number;
  images: string[];
  stock: number;
  description: string;
  category?: string;
  sellerId?: { _id?: string; name?: string } | string;
  ratingsAverage?: number;
  ratingsQuantity?: number;
}

export interface CartItem {
  _id: string; // The itemId in the cart array
  productId: Product;
  quantity: number;
  isDeleted: boolean;
}

export interface CartData {
  items: CartItem[];
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  appliedCoupon?: any;
}

export interface CartResponse {
  status: string;
  data: CartData;
  message?: string;
  sessionId?: string;
}
