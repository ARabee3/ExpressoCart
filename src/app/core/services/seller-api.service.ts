import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class SellerApiService {
  private api = inject(ApiService);

  getMyProducts(page = 1, limit = 10) {
    return this.api.get<any>('seller/my-products', { page, limit });
  }

  createProduct(formData: FormData) {
    return this.api.post<any>('products', formData);
  }

  updateProduct(id: string, body: any) {
    return this.api.put<any>(`products/${id}`, body);
  }

  deleteProduct(id: string) {
    return this.api.delete<any>(`products/${id}`);
  }

  getCategories() {
    return this.api.get<any>('categories');
  }

  getSellerOrders(page = 1, limit = 10) {
    return this.api.get<any>('seller/orders', { page, limit });
  }

  updateSellerOrderStatus(id: string, status: string) {
    return this.api.put<any>(`seller/orders/${id}/status`, { status });
  }
}
