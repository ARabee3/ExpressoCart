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

    payCard(orderId: string): Observable<{ status: string; clientSecret: string; paymentIntentId: string }> {
        return this.api.post(`orders/${orderId}/pay-intent`, {});
    }

    getMyOrders(page = 1, limit = 50): Observable<{ status: string; data: Order[]; totalOrders: number; totalPages: number; currentPage: number }> {
        return this.api.get<{ status: string; data: Order[]; totalOrders: number; totalPages: number; currentPage: number }>('orders', { page, limit });
    }

    getOrderById(id: string): Observable<{ status: string; data: Order }> {
        return this.api.get<{ status: string; data: Order }>(`orders/${id}`);
    }

    cancelOrder(id: string): Observable<any> {
        return this.api.put(`orders/${id}/cancel`, {});
    }



    trackOrder(id: string): Observable<any> {
        return this.api.get(`orders/${id}/track`);
    }
}
