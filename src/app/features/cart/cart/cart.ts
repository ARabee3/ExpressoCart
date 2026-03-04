import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { CartItems } from '../cart-items/cart-items';
import { Spinner } from '../../../shared/components/spinner/spinner';

@Component({
  selector: 'app-cart',
  imports: [CurrencyPipe, RouterLink, CartItems, Spinner],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cart implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);

  readonly cart = this.cartService.cart;
  readonly isLoading = signal(false);
  readonly couponCode = signal('');
  readonly couponError = signal('');

  readonly hasItems = computed(() => this.cart().items.length > 0);
  readonly itemCount = computed(() => this.cart().items.reduce((sum, i) => sum + i.quantity, 0));

  ngOnInit() {
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

  deleteItem(productId: string) {
    this.cartService.removeFromCart(productId).subscribe({
      next: () => this.toastService.success('Item removed from cart'),
      error: (err) => console.error('Failed to remove item', err),
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
        this.toastService.success('Coupon applied!');
      },
      error: (err) => {
        this.couponError.set(err?.error?.message || 'Invalid coupon code.');
      },
    });
  }

  clearCoupon() {
    this.cartService.removeCoupon().subscribe({
      next: () => this.toastService.success('Coupon removed'),
      error: (err) => console.error('Failed to remove coupon', err),
    });
  }
}
