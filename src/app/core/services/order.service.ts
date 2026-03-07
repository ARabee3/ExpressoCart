import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private api = inject(ApiService);

    createOrder(data: any): Observable<{ status: string, data: Order }> {
        return this.api.post<{ status: string, data: Order }>('orders', data);
    }

    payCash(orderId: string): Observable<any> {
        return this.api.put(`orders/${orderId}/pay`, {});
    }

    payCard(orderId: string): Observable<{ status: string; clientSecret: string; paymentIntentId: string }> {
        return this.api.post(`orders/${orderId}/pay-intent`, {});
    }
}
