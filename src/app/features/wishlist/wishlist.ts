import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/cart.model';
import { ProductCard } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink, ProductCard],
  templateUrl: './wishlist.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Wishlist {
  readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);

  readonly wishlistIds = computed(() => this.wishlistService.wishlistIds());

  removeFromWishlist(product: Product) {
    this.wishlistService.remove(product._id);
    this.toastService.success(`${product.name} removed from wishlist`);
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product._id, 1).subscribe(() => {
      this.toastService.success(`${product.name} added to cart`);
    });
  }

  handleWishlistToggle(product: Product) {
    this.wishlistService.toggle(product);
  }

  clearAll() {
    const items = this.wishlistService.wishlistItems();
    items.forEach((p) => this.wishlistService.remove(p._id));
    this.toastService.success('Wishlist cleared');
  }
}
