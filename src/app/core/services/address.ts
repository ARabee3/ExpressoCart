import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { UserAddress } from '../models/user.model';
import { Observable } from 'rxjs';

export interface addAddressPayload {
  city: string;
  street: string;
  state?: string;
  phone?: string;
  isDefault?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class Address {
  private readonly api = inject(ApiService);

  addAddress(payload: addAddressPayload): Observable<{ data: UserAddress[] }> {
    return this.api.patch< { data: UserAddress[] }>('address', payload);
  }

  deleteAddress(id: string): Observable<any> {
    return this.api.delete<any>(`address/${id}`);
  }

  setDefault(id: string): Observable<any> {
    return this.api.patch<any>(`address/${id}/default`, {});
  }
}
