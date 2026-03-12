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
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ReviewService, Review } from '../../../core/services/review.service';
import { OrderService } from '../../../core/services/order.service';
import { AuthState } from '../../../core/services/auth-state';
import { Product } from '../../../core/models/cart.model';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
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
  private reviewService = inject(ReviewService);
  private authState = inject(AuthState);
  private orderService = inject(OrderService);
  private fb = inject(FormBuilder);
  private titleService = inject(Title);

  quantity = signal(1);
  isLoading = signal(true);
  product = signal<Product | null>(null);
  selectedImageIndex = signal(0);

  // Reviews
  reviews = signal<Review[]>([]);
  loadingReviews = signal(false);
  reviewsTotal = signal(0);
  reviewPage = signal(1);
  submittingReview = signal(false);
  readonly hoverRating = signal(0);

  // Purchase gate
  readonly hasPurchasedProduct = signal(false);
  readonly checkingPurchase = signal(false);

  protected readonly isLoggedIn = this.authState.isLoggedIn;

  protected readonly reviewForm = this.fb.group({
    rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    review: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
  });

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productService.getProductById(productId).subscribe((p) => {
        this.product.set(p ?? null);
        this.selectedImageIndex.set(0);
        if (p) {
          this.titleService.setTitle(`${p.name} | Expresso`);
        }
        this.isLoading.set(false);
        if (p && !p._id.startsWith('prod_')) {
          this.loadReviews(p._id, 1);
          if (this.isLoggedIn()) {
            this.checkPurchase(p._id);
          }
        }
      });
    } else {
      this.isLoading.set(false);
    }
  }

  private checkPurchase(productId: string) {
    this.checkingPurchase.set(true);
    this.orderService
      .getMyOrders(1, 100)
      .pipe(catchError(() => of(null)))
      .subscribe((res) => {
        if (res) {
          const purchased = res.data.some(
            (order) =>
              (order.status === 'Delivered' || order.status === 'Shipped') &&
              order.orderItems.some((item) => {
                const id =
                  item.productId && typeof item.productId === 'object'
                    ? item.productId._id
                    : item.productId;
                return id === productId;
              }),
          );
          this.hasPurchasedProduct.set(purchased);
        }
        this.checkingPurchase.set(false);
      });
  }

  loadReviews(productId: string, page: number) {
    this.loadingReviews.set(true);
    this.reviewService
      .getProductReviews(productId, page)
      .pipe(catchError(() => of(null)))
      .subscribe((res) => {
        if (res) {
          this.reviews.update((prev) => (page === 1 ? res.data : [...prev, ...res.data]));
          this.reviewsTotal.set(res.total);
          this.reviewPage.set(page);
        }
        this.loadingReviews.set(false);
      });
  }

  loadMoreReviews() {
    const p = this.product();
    if (p) this.loadReviews(p._id, this.reviewPage() + 1);
  }

  protected readonly hasMoreReviews = computed(() => this.reviews().length < this.reviewsTotal());

  setRating(value: number) {
    this.reviewForm.patchValue({ rating: value });
  }

  submitReview() {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }
    const p = this.product();
    if (!p) return;
    this.submittingReview.set(true);
    const { rating, review } = this.reviewForm.value;
    this.reviewService
      .createReview({ product: p._id, review: review!, rating: rating! })
      .subscribe({
        next: () => {
          this.toastService.success('Review submitted!');
          this.reviewForm.reset({ rating: 0, review: '' });
          this.submittingReview.set(false);
          this.loadReviews(p._id, 1);
        },
        error: (err) => {
          const msg = err?.error?.error ?? 'Could not submit review.';
          this.toastService.error(msg);
          this.submittingReview.set(false);
        },
      });
  }

  getReviewerName(user: Review['user']): string {
    if (typeof user === 'object' && user !== null) return user.name;
    return 'Customer';
  }

  reviewStars(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i + 1 <= rating);
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
    if (!p) return null;
    const seller = p.sellerId;
    if (typeof seller === 'object' && seller !== null) {
      return (seller as { name?: string }).name?.trim() || null;
    }
    return null;
  });

  protected readonly storeName = computed(() => {
    const p = this.product();
    if (!p) return null;
    const seller = p.sellerId;
    if (typeof seller === 'object' && seller !== null) {
      return (seller as { storeName?: string }).storeName?.trim() || null;
    }
    return null;
  });

  protected readonly isOwnProduct = computed(() => {
    const uid = this.authState.user()?._id;
    const p = this.product();
    if (!uid || !p) return false;
    const seller = p.sellerId;
    return typeof seller === 'object' && seller !== null && (seller as any)._id === uid;
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
      this.cartService.addToCart(p._id, this.quantity()).subscribe(() => {
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
