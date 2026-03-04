import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Subject } from 'rxjs';
import { CurrencyPipe } from '@angular/common';

import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/cart.model';
import { Spinner } from '../spinner/spinner';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  imports: [RouterLink, RouterLinkActive, FormsModule, CurrencyPipe, Spinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  private readonly productService = inject(ProductService);

  protected readonly mobileMenuOpen = signal(false);
  protected readonly isLoggedIn = signal(false);

  protected readonly isSearchOpen = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly searchResults = signal<Product[]>([]);
  protected readonly isSearching = signal(false);
  private searchSubject = new Subject<string>();

  protected readonly wishlistCount = computed(() => this.wishlistService.count());
  protected readonly cartItemCount = computed(() => {
    const items = this.cartService.cart().items;
    return items.filter((i) => !i.isDeleted).length;
  });

  protected readonly navLinks = [
    { label: 'Home', route: '/' },
    { label: 'Products', route: '/products' },
    { label: 'Categories', route: '/categories' },
    { label: 'About', route: '/about' },
    { label: 'Contact Us', route: '/contact' },
  ];

  constructor() {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((query) => {
      if (!query.trim()) {
        this.searchResults.set([]);
        this.isSearching.set(false);
        return;
      }

      this.isSearching.set(true);
      this.productService.searchProducts(query).subscribe({
        next: (results) => {
          this.searchResults.set(results);
          this.isSearching.set(false);
        },
        error: () => {
          this.searchResults.set([]);
          this.isSearching.set(false);
        },
      });
    });
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update((v) => !v);
  }

  toggleSearch() {
    this.isSearchOpen.update((v) => !v);
    if (!this.isSearchOpen()) {
      this.closeSearch();
    }
  }

  closeSearch() {
    this.isSearchOpen.set(false);
    this.searchQuery.set('');
    this.searchResults.set([]);
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  onImageError(event: Event, productName: string) {
    const img = event.target as HTMLImageElement;
    const initials = productName
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent) {
      parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 font-bold text-lg">${initials}</div>`;
    }
  }
}
