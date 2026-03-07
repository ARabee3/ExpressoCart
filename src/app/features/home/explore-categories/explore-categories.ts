import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Product } from '../../../core/models/cart.model';
import { Category } from '../../../core/models/category.model';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-explore-categories',
  templateUrl: './explore-categories.html',
  styleUrl: './explore-categories.scss',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExploreCategories implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);

  readonly categories = toSignal(this.categoryService.getCategories(), {
    initialValue: [] as Category[],
  });
  readonly allProducts = signal<Product[]>([]);
  readonly selectedCategory = signal<Category | null>(null);
  readonly searchTerm = signal('');
  readonly wishlistIds = this.wishlistService.wishlistIds;

  // Only expose categories that have at least one matching product
  readonly categoriesWithProducts = computed(() => {
    const products = this.allProducts();
    const cats = this.categories();
    if (!products.length) return cats; // show skeleton while loading
    return cats.filter((cat) =>
      products.some(
        (p) =>
          p.category?.toLowerCase() === cat.name.toLowerCase() ||
          p.category?.toLowerCase() === cat.slug.toLowerCase(),
      ),
    );
  });

  readonly filteredCategories = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const cats = this.categoriesWithProducts();
    if (!term) return cats;
    return cats.filter((c) => c.name.toLowerCase().includes(term));
  });

  readonly displayedProducts = computed(() => {
    const selected = this.selectedCategory();
    const products = this.allProducts();
    if (!selected) return products.slice(0, 6);
    return products
      .filter((p) => {
        const cat = p.category;
        if (!cat) return false;
        return (
          cat.toLowerCase() === selected.name.toLowerCase() ||
          cat.toLowerCase() === selected.slug.toLowerCase()
        );
      })
      .slice(0, 6);
  });

  ngOnInit() {
    this.productService.getProducts().subscribe((products) => {
      this.allProducts.set(products);
      // Auto-select the first category that actually has products
      if (!this.selectedCategory()) {
        const first = this.categoriesWithProducts()[0] ?? null;
        this.selectedCategory.set(first);
      }
    });
  }

  selectCategory(category: Category) {
    this.selectedCategory.set(category);
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  onAddToCart(product: Product) {
    this.cartService.addToCart(product._id, 1);
  }

  onAddToWishlist(product: Product) {
    this.wishlistService.toggle(product);
  }
}
