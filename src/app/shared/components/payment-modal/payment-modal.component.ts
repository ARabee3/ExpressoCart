import { Component, EventEmitter, Input, Output, inject, signal, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutPaymentService } from '../../../core/services/cardPayment.service';

@Component({
    selector: 'app-payment-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './payment-modal.component.html',
})
export class PaymentModalComponent implements OnChanges, OnDestroy {
    private cardPaymentService = inject(CheckoutPaymentService);

    @Input() clientSecret: string | null = null;
    @Input() orderId: string = '';

    @Output() paymentSuccess = new EventEmitter<string>();
    @Output() paymentError = new EventEmitter<string>();
    @Output() cancel = new EventEmitter<void>();

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
                this.stripeError.set('Payment is processing. We will notify you once confirmed.');
                this.isConfirmingPayment.set(false);
            } else {
                this.stripeError.set('Unexpected payment status. Please try again.');
                this.isConfirmingPayment.set(false);
            }
        } catch (err: any) {
            this.stripeError.set(err.message || 'Payment failed');
            this.isConfirmingPayment.set(false);
        }
    }

    close() {
        this.stripeError.set(null);
        this.cancel.emit();
    }

    ngOnDestroy(): void {
        if (this.stripeElements) {
            const paymentElement = this.stripeElements.getElement('payment');
            if (paymentElement) {
                paymentElement.destroy();
            }
        }
    }
}
