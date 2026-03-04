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
      error: () => this.isLoading.set(false),
    });
  }

  increment(itemId: string, currentQuantity: number) {
    this.cartService.updateQuantity(itemId, currentQuantity + 1).subscribe();
  }

  decrement(itemId: string, currentQuantity: number) {
    if (currentQuantity > 1) {
      this.cartService.updateQuantity(itemId, currentQuantity - 1).subscribe();
    }
  }

  deleteItem(productId: string) {
    this.cartService.removeFromCart(productId).subscribe({
      next: () => this.toastService.show('Item removed from cart'),
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
        this.toastService.show('Coupon applied!');
      },
      error: (err) => {
        this.couponError.set(err?.error?.message || 'Invalid coupon code.');
      },
    });
  }

  clearCoupon() {
    this.cartService.removeCoupon().subscribe({
      next: () => this.toastService.show('Coupon removed'),
    });
  }
}
