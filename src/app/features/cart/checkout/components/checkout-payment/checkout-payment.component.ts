import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-checkout-payment',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './checkout-payment.component.html'
})
export class CheckoutPaymentComponent {
    @Output() nextStep = new EventEmitter<string>();
    @Output() backStep = new EventEmitter<void>();

    selectedPayment: 'Card' | 'Cash' = 'Card';

    continue() {
        this.nextStep.emit(this.selectedPayment);
    }

    back() {
        this.backStep.emit();
    }
}
