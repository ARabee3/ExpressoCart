import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CartData, CartResponse } from '../models/cart.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private api = inject(ApiService);

  cart = signal<CartData>({
    items: [],
    totalPrice: 0,
    discountAmount: 0,
    finalPrice: 0,
  });

  //  get cart 
  getCart(): Observable<CartResponse> {
    return this.api.get<CartResponse>('cart').pipe(
      tap((res) => this.cart.set(res.data)),
    );
  }

  //add item to cart
  addToCart(productId: string, quantity: number): Observable<CartResponse> {
    return this.api.post<CartResponse>('cart', { productId, quantity }).pipe(
      tap((res) => {
        // save sessionId returned with res
        if (res.sessionId) {
          localStorage.setItem('guest_session_id', res.sessionId);
        }
        this.cart.set(res.data);
      }),
    );
  }

  // update item quantity
  updateQuantity(itemId: string, quantity: number): Observable<CartResponse> {
    return this.api.patch<CartResponse>(`cart/items/${itemId}`, { quantity }).pipe(
      tap((res) => this.cart.set(res.data)),
    );
  }

  // remove item from cart
  removeFromCart(productId: string): Observable<CartResponse> {
    return this.api.delete<CartResponse>(`cart/items/${productId}`).pipe(
      tap((res) => this.cart.set(res.data)),
    );
  }

  // clear cart
  clearCart(): Observable<CartResponse> {
    return this.api.delete<CartResponse>('cart').pipe(
      tap((res) => this.cart.set(res.data)),
    );
  }

  // apply coupon
  applyCoupon(couponCode: string): Observable<CartResponse> {
    return this.api.post<CartResponse>('cart/coupon', { couponCode }).pipe(
      tap((res) => this.cart.set(res.data)),
    );
  }

  // remove coupon
  removeCoupon(): Observable<CartResponse> {
    return this.api.delete<CartResponse>('cart/coupon').pipe(
      tap((res) => this.cart.set(res.data)),
    );
  }
}
