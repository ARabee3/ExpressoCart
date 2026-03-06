import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { HeroCarousel } from '../hero-carousel/hero-carousel';
import { ExploreCategories } from '../explore-categories/explore-categories';
import { Benefits } from '../benefits/benefits';
import { RouterLink } from '@angular/router';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Product } from '../../../core/models/cart.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [HeroCarousel, ExploreCategories, Benefits, RouterLink, ProductCard, Spinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);

  readonly latestProducts = signal<Product[]>([]);
  readonly loadingProducts = signal<boolean>(true);
  readonly wishlistIds = this.wishlistService.wishlistIds;

  ngOnInit() {
    this.productService.getProducts().subscribe((products) => {
      this.latestProducts.set(products.slice(0, 8));
      this.loadingProducts.set(false);
    });
  }

  onAddToCart(product: Product) {
    this.cartService.addToCart(product._id, 1);
  }

  onAddToWishlist(product: Product) {
    this.wishlistService.toggle(product);
  }
}
