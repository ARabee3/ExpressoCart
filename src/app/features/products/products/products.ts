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
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

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
  private readonly route = inject(ActivatedRoute);
  private readonly titleService = inject(Title);

  /** Reactive set of wishlisted IDs for O(1) template lookup */
  readonly wishlistIds = computed(() => this.wishlistService.wishlistIds());

  readonly categories = signal<string[]>(['All']);
  readonly currentCategory = signal('All');
  readonly sortOption = signal('featured');
  readonly isSortOpen = signal(false);
  readonly allProducts = signal<Product[]>([]);
  readonly isLoading = signal(true);

  readonly pageSize = 12;
  readonly currentPage = signal(1);

  readonly sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest First' },
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

      // Apply category filter from URL query param (e.g. /products?category=sofas)
      const slug = this.route.snapshot.queryParamMap.get('category');
      if (slug) {
        const matched = cats.find(
          (c) => c.slug === slug || c.name.toLowerCase() === slug.toLowerCase(),
        );
        if (matched) {
          this.currentCategory.set(matched.name);
          this.titleService.setTitle(`${matched.name} | Expresso`);
        }
      }
    });
  }

  readonly filteredProducts = computed(() => {
    let products = this.allProducts();

    if (this.currentCategory() !== 'All') {
      const cat = this.currentCategory().toLowerCase();
      products = products.filter((p) => p.category?.toLowerCase() === cat);
    }

    const sort = this.sortOption();
    if (sort === 'price-asc') {
      products = [...products].sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      products = [...products].sort((a, b) => b.price - a.price);
    } else if (sort === 'name-asc') {
      products = [...products].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'newest') {
      // Sort by ObjectId creation timestamp (first 8 hex chars = Unix seconds)
      products = [...products].sort(
        (a, b) => parseInt(b._id.substring(0, 8), 16) - parseInt(a._id.substring(0, 8), 16),
      );
    }

    return products;
  });

  readonly totalPages = computed(() => Math.ceil(this.filteredProducts().length / this.pageSize));

  readonly paginatedProducts = computed(() => {
    const page = this.currentPage() - 1;
    return this.filteredProducts().slice(page * this.pageSize, (page + 1) * this.pageSize);
  });

  readonly pageRangeStart = computed(() =>
    this.filteredProducts().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize + 1,
  );

  readonly pageRangeEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize, this.filteredProducts().length),
  );

  /** Returns an array of page numbers to render (max 5 visible, with -1 as ellipsis) */
  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const cur = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: number[] = [1];
    if (cur > 3) pages.push(-1);
    const start = Math.max(2, cur - 1);
    const end = Math.min(total - 1, cur + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (cur < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  });

  setCategory(category: string) {
    this.currentCategory.set(category);
    this.currentPage.set(1);
    this.titleService.setTitle(
      category === 'All' ? 'All Products | Expresso' : `${category} | Expresso`,
    );
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
    this.currentPage.set(1);
  }

  setPage(page: number) {
    const total = this.totalPages();
    if (page < 1 || page > total) return;
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  handleAddToCart(product: Product) {
    this.cartService.addToCart(product._id, 1).subscribe(() => {
      this.toastService.success(`${product.name} added to cart`);
    });
  }

  handleAddToWishlist(product: Product) {
    const added = this.wishlistService.toggle(product);
    this.toastService.success(
      added ? `${product.name} added to wishlist` : `${product.name} removed from wishlist`,
    );
  }
}
