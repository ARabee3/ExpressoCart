import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';

export const orderSuccessGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const router = inject(Router);

    const prevNav = router.getCurrentNavigation()?.previousNavigation;
    const isComingFromCheckout = prevNav?.finalUrl?.toString().includes('/checkout');
    const isComingFromOrders = prevNav?.finalUrl?.toString().includes('/orders');
    const hasOrderId = !!route.queryParams['orderId'];

    // allow if user is coming from checkout or orders and has an orderId
    if ((isComingFromCheckout || isComingFromOrders) && hasOrderId) {
        return true;
    }

    // redirect to home or products if trying to access directly
    router.navigate(['/products']);
    return false;
};
