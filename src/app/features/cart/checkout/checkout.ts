import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';

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
  private toastService = inject(ToastService);

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
          // For Cash flow, order is successfully placed and marked as Processing by backend
          this.handleSuccess(orderId);
        } else if (this.selectedPayment === 'Card') {
          // For Card flow, need to generate a payment intent
          this.orderService.payCard(orderId).subscribe({
            next: (payRes) => {
              this.isPlacingOrder.set(false);
              this.activeClientSecret.set(payRes.clientSecret);
            },
            error: (err) => this.handleError(err)
          });
        }
      },
      error: (err) => this.handleError(err)
    });
  }



  handleSuccess(orderId: string) {
    this.isPlacingOrder.set(false);
    this.activeClientSecret.set(null);
    this.router.navigate(['/checkout/success'], { queryParams: { orderId } });
  }

  handleError(err?: any) {
    this.isPlacingOrder.set(false);

    let msg = 'Failed to place order.';
    const errorMsg = err?.error?.message;

    if (errorMsg) {
      msg = errorMsg;
      if (msg.includes('already has a placed order')) {
        this.toastService.error('You already have an order from this cart.');
        setTimeout(() => this.router.navigate(['/profile/orders']), 2000);
        return;
      }
      if (msg.includes('pending card order')) {
        const confirmed = window.confirm('You have a pending card order waiting for payment. Do you want to go to your orders page to complete or cancel it?');
        if (confirmed) {
          this.router.navigate(['/profile/orders']);
        }
        return;
      }
      if (msg.includes('Cart not found') || msg.includes('Cart is empty')) {
        this.toastService.error(msg);
        this.router.navigate(['/shop']);
        return;
      }
      if (msg.includes('Insufficient stock')) {
        this.toastService.error(msg);
        return;
      }
    }

    this.toastService.error(msg);
  }

  cancelPendingPayment() {
    this.activeClientSecret.set(null);
    if (this.orderId && this.selectedPayment === 'Card') {
  //if he cancel payment then cancel the order
      this.orderService.cancelOrder(this.orderId).subscribe({
        next: () => {
          this.toastService.success('Order payment cancelled successfully.');
        },
        error: () => {
          this.toastService.error('Failed to cancel the pending order.');
        }
      });
    }
  }
}
