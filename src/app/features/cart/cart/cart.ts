import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { CartItems } from '../cart-items/cart-items';
import { Spinner } from '../../../shared/components/spinner/spinner';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, FormsModule, CartItems, Spinner],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart implements OnInit {
  private cartService = inject(CartService);

  cart = this.cartService.cart;

  couponCode = signal('');
  couponError = signal('');
  isLoading = signal(false);
  isClearingCart = signal(false);

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.isLoading.set(true);
    this.cartService.getCart().subscribe({
      next: () => this.isLoading.set(false),
      error: (err) => {
        console.error('Failed to load cart', err);
        this.isLoading.set(false);
      },
    });
  }

  increment(itemId: string, currentQuantity: number) {
    this.cartService.updateQuantity(itemId, currentQuantity + 1).subscribe({
      error: (err) => console.error('Failed to update quantity', err),
    });
  }

  decrement(itemId: string, currentQuantity: number) {
    if (currentQuantity > 1) {
      this.cartService.updateQuantity(itemId, currentQuantity - 1).subscribe({
        error: (err) => console.error('Failed to update quantity', err),
      });
    }
  }

  setQuantity(itemId: string, quantity: number) {
    if (quantity > 0) {
      this.cartService
        .updateQuantity(itemId, quantity)
        .subscribe({ error: (err) => console.error('Failed to update quantity', err) });
    }
  }

  deleteItem(productId: string) {
    this.cartService.removeFromCart(productId).subscribe({
      error: (err) => console.error('Failed to remove item', err),
    });
  }

  clearCart() {
    this.isClearingCart.set(true);
    this.cartService.clearCart().subscribe({
      next: () => this.isClearingCart.set(false),
      error: (err) => {
        console.error('Failed to clear cart', err);
        this.isClearingCart.set(false);
      },
    });
  }

  applyCoupon() {
    const code = this.couponCode().trim();
    if (!code) {
      this.couponError.set('Please enter a coupon code.');
      return;
    }

    this.cartService.applyCoupon(code).subscribe({
      next: () => {
        this.couponError.set('');
        this.couponCode.set('');
      },
      error: (err) => {
        this.couponError.set(err.error?.message || 'Invalid coupon code.');
      },
    });
  }

  clearCoupon() {
    this.cartService.removeCoupon().subscribe({
      error: (err) => console.error('Failed to remove coupon', err),
    });
  }
}
