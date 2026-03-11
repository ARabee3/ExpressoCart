import { Component, EventEmitter, Output, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserAddress } from '../../../../../core/models/user.model';
import { AuthApi } from '../../../../../core/services/auth-api';

@Component({
    selector: 'app-checkout-shipping',
    imports: [CommonModule, FormsModule],
    templateUrl: './checkout-shipping.component.html'
})
export class CheckoutShippingComponent implements OnInit {
    private authApi = inject(AuthApi);
    private cdr = inject(ChangeDetectorRef);
    @Output() nextStep = new EventEmitter<{ address: any, formatted: string }>();

    addrMode: 'saved' | 'new' = 'saved';
    selectedAddrIndex = 0;
    

    savedAddresses: UserAddress[] = [];
    isLoadingAddresses = true;

    newAddress = { street: '', city: '', state: '', phone: '' };
    formErrors = { street: false, city: false, state: false, phone: false };

    ngOnInit() {
        this.authApi.getMe().subscribe({
            next: (res: any) => {
                this.savedAddresses = res.data.addresses || [];
                if (this.savedAddresses.length === 0) {
                    this.addrMode = 'new';
                }
               this.isLoadingAddresses = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.isLoadingAddresses = false;
                this.addrMode = 'new';
                this.cdr.detectChanges(); 
            }
        });
    }

    get storedAddress(): string {
        if (this.addrMode === 'saved' && this.savedAddresses.length > 0) {
            const a = this.savedAddresses[this.selectedAddrIndex];
            return `${a.street}, ${a.city}${a.state ? ', ' + a.state : ''} · 📞 ${a.phone || ''}`;
        }
        return `${this.newAddress.street}, ${this.newAddress.city}, ${this.newAddress.state} · 📞 ${this.newAddress.phone}`;
    }

    continue() {
        if (this.addrMode === 'new') {
            if (!this.validateNewAddress()) return;
            const formatted = this.storedAddress;
            const address = { ...this.newAddress };
            this.nextStep.emit({ address, formatted });
        } else {
            if (this.savedAddresses.length === 0) return;
            const addr = this.savedAddresses[this.selectedAddrIndex];
            const address = { street: addr.street, city: addr.city, state: addr.state, phone: addr.phone };
            const formatted = this.storedAddress;
            this.nextStep.emit({ address, formatted });
        }
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
