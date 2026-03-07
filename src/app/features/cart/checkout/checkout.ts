import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';

import { CheckoutStepperComponent } from './components/checkout-stepper/checkout-stepper.component';
import { CheckoutShippingComponent } from './components/checkout-shipping/checkout-shipping.component';
import { CheckoutPaymentComponent } from './components/checkout-payment/checkout-payment.component';
import { CheckoutReviewComponent } from './components/checkout-review/checkout-review.component';
import { CheckoutSummaryComponent } from './components/checkout-summary/checkout-summary.component';

@Component({
  selector: 'app-checkout',
  imports: [
    CommonModule,
    CheckoutStepperComponent,
    CheckoutShippingComponent,
    CheckoutPaymentComponent,
    CheckoutReviewComponent,
    CheckoutSummaryComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkout.html',
})
export class Checkout implements OnInit {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  currentStep = 1;
  orderId = '';
  isPlacingOrder = signal(false);

  // Payment State
  activeClientSecret = signal<string | null>(null);

  resolvedAddressObj: any = null;
  resolvedAddressFormatted = '';
  selectedPayment = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const orderId = params['orderId'];
      const status = params['payment_intent_status'] || params['status'];
      const success = params['success'];

      if (orderId && (status === 'succeeded' || success === 'true')) {
        this.handleSuccess(orderId);
      }
    });
  }

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
    this.isPlacingOrder.set(true);

    const orderData = {
      cartId: cartId,
      shippingAddress: this.resolvedAddressObj,
      paymentMethod: this.selectedPayment
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (res) => {
        const orderId = res.data._id;
        this.orderId = orderId;

        if (this.selectedPayment === 'Cash') {
          this.orderService.payCash(orderId).subscribe({
            next: () => this.handleSuccess(orderId),
            error: () => this.handleError()
          });
        } else if (this.selectedPayment === 'Card') {
          this.orderService.payCard(orderId).subscribe({
            next: (payRes) => {
              this.isPlacingOrder.set(false);
              this.activeClientSecret.set(payRes.clientSecret);
            },
            error: () => this.handleError()
          });
        }
      },
      error: () => this.handleError()
    });
  }

  handleSuccess(orderId: string) {
    this.isPlacingOrder.set(false);
    this.activeClientSecret.set(null);
    this.router.navigate(['/checkout/success'], { queryParams: { orderId } });
  }

  handleError(msg?: string) {
    this.isPlacingOrder.set(false);
    console.error('Failed to place order.', msg);
  }
}
