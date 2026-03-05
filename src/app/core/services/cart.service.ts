import { Injectable, signal } from '@angular/core';
import { of, delay, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Product, CartItem, CartData, CartResponse } from '../models/cart.model';
import { inject } from '@angular/core';
import { ApiService } from './api.service';
@Injectable({ providedIn: 'root' })
export class CartService {

  //using in integration with backend
    private api = inject(ApiService);

  // Expose reactive cart state
  cart = signal<CartData>({
    items: [],
    totalPrice: 0,
    discountAmount: 0,
    finalPrice: 0,
  });


  // integration with backend
  // helper fun
  private setCart(data: CartData): void {
  this.cart.set({
    ...data,
    items: data.items.filter((item: any) => !item.isDeleted)
  });
}
  //  get cart 
  getCart(): Observable<CartResponse> {
    return this.api.get<CartResponse>('cart').pipe(
      tap((res) => {
         console.log('GET CART RESPONSE:', res.data);
       this.setCart(res.data)}),
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
        this.setCart(res.data);
      }),
    );
  }

  // update item quantity
  updateQuantity(itemId: string, quantity: number): Observable<CartResponse> {
    return this.api.patch<CartResponse>(`cart/items/${itemId}`, { quantity }).pipe(
      tap((res) => this.setCart(res.data)),
    );
  }

  // remove item from cart
  removeFromCart(productId: string): Observable<CartResponse> {
    return this.api.delete<CartResponse>(`cart/items/${productId}`).pipe(
      tap((res) =>this.setCart(res.data)),
    );
  }

  // clear cart
  clearCart(): Observable<CartResponse> {
    return this.api.delete<CartResponse>('cart').pipe(
      tap((res) => this.setCart(res.data)),
    );
  }

  // apply coupon
  applyCoupon(couponCode: string): Observable<CartResponse> {
    return this.api.post<CartResponse>('cart/coupon', { couponCode }).pipe(
      tap((res) => this.setCart(res.data)),
    );
  }

  // remove coupon
  removeCoupon(): Observable<CartResponse> {
    return this.api.delete<CartResponse>('cart/coupon').pipe(
      tap((res) => this.setCart(res.data)),
    );
  }
}