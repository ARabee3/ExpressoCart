import { Injectable, signal } from '@angular/core';
import { of, delay, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Product, CartItem, CartData, CartResponse } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  // Expose reactive cart state
  cart = signal<CartData>({
    items: [],
    totalPrice: 0,
    discountAmount: 0,
    finalPrice: 0,
  });

  // --- MOCK INITIAL DATA ---
  private mockCartData: CartData = {
    items: [
      {
        _id: 'item_1',
        productId: {
          _id: 'prod_1',
          name: 'Gradient Graphic T-shirt',
          price: 145,
          stock: 50,
          images: [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
          ],
          description: 'A stylish gradient t-shirt',
        } as Product,
        quantity: 1,
        isDeleted: false,
      },
      {
        _id: 'item_2',
        productId: {
          _id: 'prod_2',
          name: 'Checkered Shirt',
          price: 180,
          stock: 30,
          images: [
            'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=300&h=300&fit=crop',
          ],
          description: 'Red checkered shirt',
        } as Product,
        quantity: 1,
        isDeleted: false,
      },
      {
        _id: 'item_3',
        productId: {
          _id: 'prod_3',
          name: 'Skinny Fit Jeans',
          price: 240,
          stock: 25,
          images: [
            'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=300&h=300&fit=crop',
          ],
          description: 'Blue skinny jeans',
        } as Product,
        quantity: 1,
        isDeleted: false,
      },
    ],
    totalPrice: 565,
    discountAmount: 0,
    finalPrice: 565,
    appliedCoupon: null,
  };

  constructor() {
    this.initSessionId();
  }

  private initSessionId() {
    let sessionId = localStorage.getItem('guest_session_id');
    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('guest_session_id', sessionId);
    }
  }

  // --- HELPER TO RECALCULATE MOCK CART ---
  private recalcCart() {
    let subtotal = 0;
    this.mockCartData.items.forEach((item) => {
      if (!item.isDeleted) {
        subtotal += item.productId.price * item.quantity;
      }
    });

    const activeItems = this.mockCartData.items.filter((i) => !i.isDeleted);
    this.mockCartData.items = activeItems;

    this.mockCartData.totalPrice = subtotal;

    if (this.mockCartData.appliedCoupon) {
      // Mock discount: 20%
      this.mockCartData.discountAmount = subtotal * 0.2;
    } else {
      this.mockCartData.discountAmount = 0;
    }

    this.mockCartData.finalPrice = Math.max(0, subtotal - this.mockCartData.discountAmount);
  }

  // --- MOCK METHODS ---
  getCart() {
    return of({
      status: 'success',
      data: { ...this.mockCartData },
    } as CartResponse).pipe(
      delay(300), // Simulate network delay
      tap((res) => this.cart.set(res.data)),
    );
  }

  addToCart(productId: string, quantity: number) {
    /*
const sessionId = localStorage.getItem('guest_session_id');

  const body: any = { productId, quantity };

  // Send sessionId in body IF we already have one
  if (sessionId) body.sessionId = sessionId;

  return this.http.post<CartResponse>(`${BASE_URL}/cart`, body).pipe(
    tap(res => {
      if (res.sessionId) {
        localStorage.setItem('guest_session_id', res.sessionId);
      }
      this.cart.set(res.data);
    }),
    map(res => res.data)
  );
 */

    this.recalcCart();
    return of({ status: 'success', data: { ...this.mockCartData } } as CartResponse).pipe(
      delay(300),
      tap((res) => this.cart.set(res.data)),
    );
  }

  updateQuantity(itemId: string, quantity: number) {
    const item = this.mockCartData.items.find((i) => i._id === itemId);
    if (item) {
      item.quantity = quantity;
    }
    this.recalcCart();
    return of({ status: 'success', data: { ...this.mockCartData } } as CartResponse).pipe(
      delay(200),
      tap((res) => this.cart.set(res.data)),
    );
  }

  removeFromCart(productId: string) {
    const itemIndex = this.mockCartData.items.findIndex((i) => i.productId._id === productId);
    if (itemIndex > -1) {
      this.mockCartData.items[itemIndex].isDeleted = true;
    }
    this.recalcCart();
    return of({ status: 'success', data: { ...this.mockCartData } } as CartResponse).pipe(
      delay(200),
      tap((res) => this.cart.set(res.data)),
    );
  }

  clearCart() {
    this.mockCartData.items = [];
    this.recalcCart();
    return of({ status: 'success', data: { ...this.mockCartData } } as CartResponse).pipe(
      delay(200),
      tap((res) => this.cart.set(res.data)),
    );
  }

  applyCoupon(couponCode: string) {
    if (couponCode.toUpperCase() === 'SAVE20') {
      this.mockCartData.appliedCoupon = 'SAVE20';
      this.recalcCart();
      return of({ status: 'success', data: { ...this.mockCartData } } as CartResponse).pipe(
        delay(300),
        tap((res) => this.cart.set(res.data)),
      );
    } else {
      // Simulate error
      return new Observable<CartResponse>((subscriber) => {
        setTimeout(() => {
          subscriber.error({ error: { message: 'Invalid promo code. Try SAVE20' } });
        }, 300);
      });
    }
  }

  removeCoupon() {
    this.mockCartData.appliedCoupon = null;
    this.recalcCart();
    return of({ status: 'success', data: { ...this.mockCartData } } as CartResponse).pipe(
      delay(200),
      tap((res) => this.cart.set(res.data)),
    );
  }
}
