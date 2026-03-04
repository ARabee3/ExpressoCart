import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly _items = signal<Product[]>([]);

  readonly wishlistItems = this._items.asReadonly();
  readonly count = computed(() => this._items().length);
  /** Reactive Set of wishlisted product IDs for O(1) lookup in templates */
  readonly wishlistIds = computed(() => new Set(this._items().map((p) => p._id)));

  isInWishlist(productId: string): boolean {
    return this.wishlistIds().has(productId);
  }

  /** Toggles product in wishlist. Returns true if added, false if removed. */
  toggle(product: Product): boolean {
    const inWishlist = this.isInWishlist(product._id);
    if (inWishlist) {
      this._items.update((list) => list.filter((p) => p._id !== product._id));
      return false;
    } else {
      this._items.update((list) => [...list, product]);
      return true;
    }
  }

  remove(productId: string) {
    this._items.update((list) => list.filter((p) => p._id !== productId));
  }
}
