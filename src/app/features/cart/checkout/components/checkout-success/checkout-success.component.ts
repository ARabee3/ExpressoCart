import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-checkout-success',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './checkout-success.component.html'
})
export class CheckoutSuccessComponent {
    @Input() orderId: string = '';
}
