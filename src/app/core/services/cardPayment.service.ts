import { Injectable, inject, signal } from '@angular/core';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';

@Injectable({ providedIn: 'root' })
export class CheckoutPaymentService {
    private stripePublicKey = 'pk_test_51T2uZq3O5QrL1lMzR5UlQjuQMxcBeVYSRdZWpp10wqDBqjOZ5KZ6Fn16lzF1Ff4LTdhd4icIghLJ70OvZzpi3fjJ00f3s3ub9H';
    private stripePromise = loadStripe(this.stripePublicKey);

    async initializeElements(clientSecret: string): Promise<StripeElements> {
        const stripe = await this.stripePromise;
        if (!stripe) throw new Error('Stripe failed to load');

        return stripe.elements({
            clientSecret,
            appearance: {
                theme: 'stripe',
                variables: {
                    colorPrimary: '#1a1a2e',
                    borderRadius: '12px'
                }
            }
        });
    }

    async confirmPayment(elements: StripeElements, orderId: string): Promise<any> {
        const stripe = await this.stripePromise;
        if (!stripe) throw new Error('Stripe failed to load');

        return stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout?orderId=${orderId}`
            },
            redirect: 'if_required'
        });
    }
}