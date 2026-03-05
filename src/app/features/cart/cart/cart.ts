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
import { from, throwError } from 'rxjs';
import { concatMap, catchError, toArray } from 'rxjs/operators';

@Component({
  selector: 'app-cart',
  imports: [CurrencyPipe, RouterLink, CartItems, Spinner],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart implements OnInit {

  //integration with backend
   cartService = inject(CartService);
  private toastService = inject(ToastService);

  readonly cart = this.cartService.cart;
  readonly isLoading = signal(false);
  readonly couponCode = signal('');
  readonly couponError = signal('');

  readonly hasItems = computed(() => this.cart().items.length > 0);
  readonly itemCount = computed(() => this.cart().items.reduce((sum, i) => sum + i.quantity, 0));
 


  isClearingCart = signal(false);
  isCheckingOut = signal(false);
  pendingUpdates = new Map<string, number>();

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    // if no session skip call to prevent error not found
    if (!localStorage.getItem('guest_session_id')) return;

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
    const item = this.cart().items.find((i) => i._id === itemId);
     if (!item) return;

  if (currentQuantity < item.productId.stock) {
    this.updateLocalQuantity(itemId, currentQuantity + 1);
  }
  else{
    this.toastService.error('Max stock reached!'); // not be reached but for safety
  }
    
  }

  decrement(itemId: string, currentQuantity: number) {
    if (currentQuantity > 1) {
      this.updateLocalQuantity(itemId, currentQuantity - 1);
    }
  }

  // setQuantity(itemId: string, quantity: number) {
  //   const item = this.cart().items.find((i) => i._id === itemId);
  //   if (item && quantity > 0 && quantity <= item.productId.stock) {
  //     this.updateLocalQuantity(itemId, quantity);
  //   }
  // }

  updateLocalQuantity(itemId: string, quantity: number) {
    this.pendingUpdates.set(itemId, quantity);

    this.cartService.cart.update((cart) => {
      const updatedItems = cart.items.map((item) => {
        if (item._id === itemId) {
          return { ...item, quantity };
        }
        return item;
      });

      const totalPrice = updatedItems.reduce(
        (sum, item) => sum + item.productId.price * item.quantity,
        0
      );

      return {
        ...cart,
        items: updatedItems,
        totalPrice,
        finalPrice: Math.max(0, totalPrice - cart.discountAmount),
      };
    });
  }

  checkout() {
    if (this.pendingUpdates.size === 0) {
      this.toastService.success('Proceeding to checkout...');
      // Logic for checkout 
      return;
    }

    this.isCheckingOut.set(true);
    const updateCalls = Array.from(this.pendingUpdates.entries());

    from(updateCalls).pipe(
      concatMap(([itemId, quantity]) =>
        this.cartService.updateQuantity(itemId, quantity).pipe(
          catchError(err => throwError(() => err))
        )
      ),
      toArray()
    ).subscribe({
      next: () => {
        this.pendingUpdates.clear();
        this.isCheckingOut.set(false);
        this.toastService.success('Cart synced successfully. Proceeding to checkout...');
      },
      error: (err) => {
        console.error('Checkout stock validation error', err);
        this.isCheckingOut.set(false);
        if (err.error && err.error.data) {
          this.cartService.cart.set(err.error.data);
          this.pendingUpdates.clear();
        }
        this.toastService.error(err.error?.message || 'Stock issue detected. Cart has been updated.');
      }
    });
  }

  deleteItem(productId: string) {
     const snapshot = this.cartService.cart();

  this.cartService.cart.update(cart => ({
    ...cart,
    items: cart.items.filter(i => i.productId._id !== productId)
  }));

  const item = snapshot.items.find(i => i.productId._id === productId);
  if (item) this.pendingUpdates.delete(item._id);

  this.cartService.removeFromCart(productId).subscribe({
    error: (err) => {
      this.cartService.cart.set(snapshot); 
      console.error('Failed to remove item', err);
    }
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
