import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/cart.model';

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

  protected readonly isOutOfStock = computed(() => this.product().stock <= 0);
  protected readonly primaryImage = computed(() => this.product().images?.[0] ?? '');

  protected readonly fallbackImage =
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80';

  protected readonly sellerName = computed(() => {
    const seller = this.product().sellerId;
    if (typeof seller === 'object' && seller !== null) {
      return (seller as { name: string }).name || 'Dummy Data';
    }
    return 'Dummy Data';
  });

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
