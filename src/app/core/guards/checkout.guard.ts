import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { AuthState } from '../services/auth-state';

export const checkoutGuard: CanActivateFn = () => {
    const cartService = inject(CartService);
    const authState = inject(AuthState);
    const router = inject(Router);

    const prevNav = router.getCurrentNavigation()?.previousNavigation;
    const isComingFromCart = prevNav?.finalUrl?.toString().includes('/cart');

    // must be logged in
    if (!authState.isLoggedIn()) {
        router.navigate(['/auth/login']);
        return false;
    }

    // cart must have items AND user must come from the Cart page to ensure stock sync
    if (cartService.cart().items.length > 0 && isComingFromCart) {
        return true;
    }

    // if directly accessing or cart is empty, send back to cart
    router.navigate(['/cart']);
    return false;
};
