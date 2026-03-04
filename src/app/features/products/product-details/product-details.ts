import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Product } from '../../../core/models/cart.model';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  private wishlistService = inject(WishlistService);

  quantity = signal(1);
  isLoading = signal(true);
  product = signal<Product | null>(null);

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productService.getProductById(productId).subscribe((p) => {
        this.product.set(p ?? null);
        this.isLoading.set(false);
      });
    } else {
      this.isLoading.set(false);
    }
  }

  protected readonly isOutOfStock = computed(() => {
    const p = this.product();
    return p ? p.stock <= 0 : true;
  });

  protected readonly isProductInWishlist = computed(() => {
    const p = this.product();
    return p ? this.wishlistService.isInWishlist(p._id) : false;
  });

  protected readonly sellerName = computed(() => {
    const p = this.product();
    if (!p) return 'Dummy Data';
    const seller = p.sellerId;
    if (typeof seller === 'object' && seller !== null) {
      return (seller as { name: string }).name || 'Dummy Data';
    }
    return 'Dummy Data';
  });

  incrementQuantity() {
    const p = this.product();
    if (p && this.quantity() < p.stock) {
      this.quantity.update((q) => q + 1);
    }
  }

  decrementQuantity() {
    if (this.quantity() > 1) {
      this.quantity.update((q) => q - 1);
    }
  }

  addToCart() {
    const p = this.product();
    if (p && !this.isOutOfStock()) {
      this.cartService.addToCart(p, this.quantity()).subscribe(() => {
        this.toastService.success(`${this.quantity()} × ${p.name} added to cart`);
      });
    }
  }

  addToWishlist() {
    const p = this.product();
    if (p) {
      const added = this.wishlistService.toggle(p);
      this.toastService.success(
        added ? `${p.name} added to wishlist` : `${p.name} removed from wishlist`,
      );
    }
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
  }
}
