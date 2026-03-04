import {
  ChangeDetectionStrategy,
  Component,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { Product } from '../../../core/models/cart.model';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { FormsModule } from '@angular/forms';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.html',
  styleUrl: './products.scss',
  imports: [ProductCard, FormsModule, Spinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly productService = inject(ProductService);
  private readonly toastService = inject(ToastService);
  private readonly wishlistService = inject(WishlistService);
  private readonly categoryService = inject(CategoryService);

  /** Reactive set of wishlisted IDs for O(1) template lookup */
  readonly wishlistIds = computed(() => this.wishlistService.wishlistIds());

  readonly categories = signal<string[]>(['All']);
  readonly currentCategory = signal('All');
  readonly sortOption = signal('featured');
  readonly isSortOpen = signal(false);
  readonly allProducts = signal<Product[]>([]);
  readonly isLoading = signal(true);

  readonly sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-asc', label: 'Price: Low → High' },
    { value: 'price-desc', label: 'Price: High → Low' },
    { value: 'name-asc', label: 'Name: A → Z' },
  ];

  readonly currentSortLabel = computed(
    () => this.sortOptions.find((o) => o.value === this.sortOption())?.label ?? 'Featured',
  );

  ngOnInit() {
    this.productService.getProducts().subscribe((products) => {
      this.allProducts.set(products);
      this.isLoading.set(false);
    });

    this.categoryService.getCategories().subscribe((cats) => {
      this.categories.set(['All', ...cats.map((c) => c.name)]);
    });
  }

  readonly filteredProducts = computed(() => {
    let products = this.allProducts();

    if (this.currentCategory() !== 'All') {
      products = products.filter((p) => p.category === this.currentCategory());
    }

    const sort = this.sortOption();
    if (sort === 'price-asc') {
      products = [...products].sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      products = [...products].sort((a, b) => b.price - a.price);
    } else if (sort === 'name-asc') {
      products = [...products].sort((a, b) => a.name.localeCompare(b.name));
    }

    return products;
  });

  setCategory(category: string) {
    this.currentCategory.set(category);
  }

  toggleSort() {
    this.isSortOpen.update((v) => !v);
  }

  closeSortDropdown() {
    this.isSortOpen.set(false);
  }

  setSortOption(value: string) {
    this.sortOption.set(value);
    this.isSortOpen.set(false);
  }

  handleAddToCart(product: Product) {
    this.cartService.addToCart(product, 1).subscribe(() => {
      this.toastService.show(`${product.name} added to cart`);
    });
  }

  handleAddToWishlist(product: Product) {
    const added = this.wishlistService.toggle(product);
    this.toastService.show(
      added ? `${product.name} added to wishlist` : `${product.name} removed from wishlist`,
    );
  }
}
