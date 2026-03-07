import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';

@Component({
    selector: 'app-order-success',
    imports: [CommonModule, RouterLink],
    templateUrl: './order-success.component.html'
})
export class OrderSuccess implements OnInit {
    private route = inject(ActivatedRoute);
    private cartService = inject(CartService);

    orderId = signal<string | null>(null);

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.orderId.set(params['orderId']);
        });

        this.cartService.cart.set({
            _id: '',
            items: [],
            totalPrice: 0,
            discountAmount: 0,
            finalPrice: 0,
        });
    }
}
