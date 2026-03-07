import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';

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
  private orderService = inject(OrderService);

  currentStep = 1;
  orderPlaced = false;
  orderId = '';
  isPlacingOrder = signal(false);

  resolvedAddressObj: any = null;
  resolvedAddressFormatted = '';
  selectedPayment = '';

  onShippingNext(event: { address: any, formatted: string }) {
    this.resolvedAddressObj = event.address;
    this.resolvedAddressFormatted = event.formatted;
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
    const cartId = this.cartService.cart()._id;
   // console.log("cartId"+cartId);
    this.isPlacingOrder.set(true);

    const orderData = {
      cartId: cartId,
      shippingAddress: this.resolvedAddressObj,
      paymentMethod: this.selectedPayment
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (res) => {
        //console.log("responseeeee"+res);
        const orderId = res.data._id;
        if (this.selectedPayment === 'Cash') {
          this.orderService.payCash(orderId).subscribe({
            next: () => this.handleSuccess(orderId),
            error: () => this.handleError()
          });
        }
      },
      error: () => this.handleError()
    });
  }

  private handleSuccess(orderId: string) {
    this.isPlacingOrder.set(false);
    this.orderPlaced = true;
    this.orderId = orderId;

    this.cartService.cart.set({
      _id: '',
      items: [],
      totalPrice: 0,
      discountAmount: 0,
      finalPrice: 0,
      appliedCoupon: null
    });
  }

  private handleError() {
    this.isPlacingOrder.set(false);
    console.error('Failed to place order.');
  }
}
