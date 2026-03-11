import { Component, EventEmitter, Input, Output, inject, signal, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../../../core/services/cart.service';
import { PaymentModalComponent } from '../../../../../shared/components/payment-modal/payment-modal.component';

@Component({
    selector: 'app-checkout-review',
    imports: [CommonModule, PaymentModalComponent],
    templateUrl: './checkout-review.component.html'
})
export class CheckoutReviewComponent {
    private cartService = inject(CartService);

    cart = this.cartService.cart;

    @Input() resolvedAddress: string = '';
    @Input() selectedPayment: string = '';
    @Input() isPlacingOrder: boolean = false;
    @Input() clientSecret: string | null = null;
    @Input() orderId: string = '';

    @Output() backStep = new EventEmitter<void>();
    @Output() placeOrder = new EventEmitter<void>();
    @Output() paymentSuccess = new EventEmitter<string>();
    @Output() paymentError = new EventEmitter<string>();
    @Output() cancelPayment = new EventEmitter<void>();

    back() {
        this.backStep.emit();
    }

    submit() {
        this.placeOrder.emit();
    }

    onPaymentCancel() {
        this.cancelPayment.emit();
    }

    onPaymentSuccess(id: string) {
        this.paymentSuccess.emit(id);
    }

    onPaymentError(err: string) {
        this.paymentError.emit(err);
    }
}
