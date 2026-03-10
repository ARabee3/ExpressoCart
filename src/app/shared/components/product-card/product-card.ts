import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/cart.model';
import { AuthState } from '../../../core/services/auth-state';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  imports: [CurrencyPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly isInWishlist = input<boolean>(false);
  readonly addToCart = output<Product>();
  readonly addToWishlist = output<Product>();

  private readonly authState = inject(AuthState);

  protected readonly isOutOfStock = computed(() => this.product().stock <= 0);
  protected readonly primaryImage = computed(() => this.product().images?.[0] ?? '');

  protected readonly fallbackImage =
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80';

  protected readonly sellerName = computed(() => {
    const seller = this.product().sellerId;
    if (typeof seller === 'object' && seller !== null) {
      return (seller as { name?: string }).name?.trim() || null;
    }
    return null;
  });

  protected readonly storeName = computed(() => {
    const seller = this.product().sellerId;
    if (typeof seller === 'object' && seller !== null) {
      return (seller as { storeName?: string }).storeName?.trim() || null;
    }
    return null;
  });

  protected readonly isOwnProduct = computed(() => {
    const uid = this.authState.user()?._id;
    const seller = this.product().sellerId;
    return !!uid && typeof seller === 'object' && seller !== null && (seller as any)._id === uid;
  });

  protected readonly stars = computed(() => {
    const avg = this.product().ratingsAverage ?? 0;
    const full = Math.floor(avg);
    const half = avg - full >= 0.4;
    return Array.from({ length: 5 }, (_, i) => {
      if (i < full) return 'full';
      if (i === full && half) return 'half';
      return 'empty';
    });
  });

  protected readonly ratingValue = computed(() => this.product().ratingsAverage ?? 0);

  onAddToCart(event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();
    if (!this.isOutOfStock()) {
      this.addToCart.emit(this.product());
    }
  }

  onAddToWishlist(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.addToWishlist.emit(this.product());
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = this.fallbackImage;
  }
}
