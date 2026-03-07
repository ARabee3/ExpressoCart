import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserAddress } from '../../../../../core/models/user.model';

@Component({
    selector: 'app-checkout-shipping',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './checkout-shipping.component.html'
})
export class CheckoutShippingComponent {
    @Output() nextStep = new EventEmitter<string>();

    addrMode: 'saved' | 'new' = 'saved';
    selectedAddrIndex = 0;

    savedAddresses: UserAddress[] = [
        { id: 'addr_001', street: 'Abdelsalam Aref Street', city: 'Beni Suef', state: 'Beni Suef', phone: '+20 100 123 4567', isDefault: true },
        { id: 'addr_002', street: 'salah salem street', city: 'Beni Suef', state: 'Beni Suef', phone: '+20 111 987 6543', isDefault: false },
        { id: 'addr_003', street: 'El Kornish Street', city: 'Beni Suef', state: 'Beni Suef', phone: '+20 122 456 7890', isDefault: false },
    ];

    newAddress = { street: '', city: '', state: '', phone: '' };
    formErrors = { street: false, city: false, state: false, phone: false };

    get resolvedAddress(): string {
        if (this.addrMode === 'saved') {
            const a = this.savedAddresses[this.selectedAddrIndex];
            return `${a.street}, ${a.city}, ${a.state} · 📞 ${a.phone}`;
        }
        return `${this.newAddress.street}, ${this.newAddress.city}, ${this.newAddress.state} · 📞 ${this.newAddress.phone}`;
    }

    continue() {
        if (this.addrMode === 'new') {
            if (!this.validateNewAddress()) return;
        }
        this.nextStep.emit(this.resolvedAddress);
    }

    private validateNewAddress(): boolean {
        this.formErrors = {
            street: !this.newAddress.street.trim(),
            city: !this.newAddress.city.trim(),
            state: !this.newAddress.state.trim(),
            phone: !this.newAddress.phone.trim(),
        };
        return !Object.values(this.formErrors).some(Boolean);
    }
}
