import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../../../core/services/cart.service';

@Component({
    selector: 'app-checkout-summary',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './checkout-summary.component.html'
})
export class CheckoutSummaryComponent {
    private cartService = inject(CartService);
    cart = this.cartService.cart;

    itemCount = computed(() =>
        this.cart().items.reduce((sum, i) => sum + i.quantity, 0)
    );
}
