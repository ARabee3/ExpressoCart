import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';

import { CheckoutStepperComponent } from './components/checkout-stepper/checkout-stepper.component';
import { CheckoutShippingComponent } from './components/checkout-shipping/checkout-shipping.component';
import { CheckoutPaymentComponent } from './components/checkout-payment/checkout-payment.component';
import { CheckoutReviewComponent } from './components/checkout-review/checkout-review.component';
import { CheckoutSummaryComponent } from './components/checkout-summary/checkout-summary.component';
import { CheckoutSuccessComponent } from './components/checkout-success/checkout-success.component';

@Component({
  selector: 'app-checkout',
  imports: [
    CommonModule,
    CheckoutStepperComponent,
    CheckoutShippingComponent,
    CheckoutPaymentComponent,
    CheckoutReviewComponent,
    CheckoutSummaryComponent,
    CheckoutSuccessComponent
  ],
  templateUrl: './checkout.html',
})
export class Checkout {
  private cartService = inject(CartService);

  currentStep = 1;
  orderPlaced = false;
  orderId = '';
  isPlacingOrder = signal(false);

  resolvedAddress = '';
  selectedPayment = '';

  onShippingNext(address: string) {
    this.resolvedAddress = address;
    this.currentStep = 2;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onPaymentNext(payment: string) {
    this.selectedPayment = payment;
    this.currentStep = 3;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goStep(n: number) {
    this.currentStep = n;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  placeOrder() {
    this.isPlacingOrder.set(true);

    // simulate API delay
    setTimeout(() => {
      this.isPlacingOrder.set(false);
      this.orderPlaced = true;
      this.orderId = `EXP-${Date.now().toString().slice(-8)}`;

      // Clear cart after order
      this.cartService.cart.set({
        items: [],
        totalPrice: 0,
        discountAmount: 0,
        finalPrice: 0,
        appliedCoupon: null
      });
    }, 1800);
  }
}