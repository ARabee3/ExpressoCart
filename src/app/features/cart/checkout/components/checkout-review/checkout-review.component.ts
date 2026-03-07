import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../../../core/services/cart.service';

@Component({
    selector: 'app-checkout-review',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './checkout-review.component.html'
})
export class CheckoutReviewComponent {
    private cartService = inject(CartService);
    cart = this.cartService.cart;

    @Input() resolvedAddress: string = '';
    @Input() selectedPayment: string = '';
    @Input() isPlacingOrder: boolean = false;

    @Output() backStep = new EventEmitter<void>();
    @Output() placeOrder = new EventEmitter<void>();

    back() {
        this.backStep.emit();
    }

    submit() {
        this.placeOrder.emit();
    }
}
