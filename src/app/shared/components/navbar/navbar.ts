import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  private readonly cartService = inject(CartService);
  protected readonly mobileMenuOpen = signal(false);
  protected readonly isLoggedIn = signal(false);

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

  toggleMobileMenu() {
    this.mobileMenuOpen.update((v) => !v);
  }
}
