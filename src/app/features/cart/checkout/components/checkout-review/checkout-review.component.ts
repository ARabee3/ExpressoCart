import { Component, EventEmitter, Input, Output, inject, signal, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../../../core/services/cart.service';
import { CheckoutPaymentService } from '../../../../../core/services/cardPayment.service';

@Component({
    selector: 'app-checkout-review',
    imports: [CommonModule],
    templateUrl: './checkout-review.component.html'
})
export class CheckoutReviewComponent implements OnChanges,OnDestroy {
    private cartService = inject(CartService);
    private cardPaymentService = inject(CheckoutPaymentService);

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

    isConfirmingPayment = signal(false);
    stripeError = signal<string | null>(null);
    private stripeElements: any;

    ngOnChanges(changes: SimpleChanges) {
        if (changes['clientSecret']?.currentValue) {
            this.initStripeUI();
        }
    }

    async initStripeUI() {
        if (!this.clientSecret) return;
        this.stripeError.set(null);
        try {
            // Small delay to ensure #payment-element is in DOM
            setTimeout(async () => {
                this.stripeElements = await this.cardPaymentService.initializeElements(this.clientSecret!);
                const paymentElement = this.stripeElements.create('payment');
                paymentElement.mount('#payment-element');
            }, 0);
        } catch (err: any) {
            this.stripeError.set(err.message || 'Failed to load Card UI');
        }
    }

    async confirmPayment() {
        this.isConfirmingPayment.set(true);
        this.stripeError.set(null);

        try {
            const result = await this.cardPaymentService.confirmPayment(this.stripeElements, this.orderId);

            if (result.error) {
                this.stripeError.set(result.error.message);
                this.isConfirmingPayment.set(false);
                this.paymentError.emit(result.error.message);
            } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
                this.paymentSuccess.emit(this.orderId);
            } else if (result.paymentIntent && result.paymentIntent.status === 'processing') {
                // Payment is being processed, but not yet succeeded. 
                // We'll let the redirect or a background process handle it, or show a message.
                this.stripeError.set('Payment is processing. We will notify you once confirmed.');
                this.isConfirmingPayment.set(false);
            } else {
                // Handle other statuses or if stripe redirects (redirect happens automatically, 
                // so code execution here might stop).
            }
        } catch (err: any) {
            this.stripeError.set(err.message || 'Payment failed');
            this.isConfirmingPayment.set(false);
        }
    }

    back() {
        this.backStep.emit();
    }

    submit() {
        this.placeOrder.emit();
    }

    closePaymentModal() {
        this.stripeError.set(null);
        this.cancelPayment.emit();
    }
    ngOnDestroy(): void {
        if (this.stripeElements) {
            // Unmount and clean up the iframe to prevent memory leaks
            const paymentElement = this.stripeElements.getElement('payment');
            if (paymentElement) {
                paymentElement.destroy();
            }
        }
    }
}
