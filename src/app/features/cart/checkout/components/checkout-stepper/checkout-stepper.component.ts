import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-checkout-stepper',
    imports: [CommonModule],
    templateUrl: './checkout-stepper.component.html'
})
export class CheckoutStepperComponent {
    @Input() currentStep: number = 1;
}
