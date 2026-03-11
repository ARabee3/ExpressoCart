import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SellerApiService } from '../../../core/services/seller-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { OrderStatus } from '../../../core/models/order.model';

@Component({
  selector: 'app-seller-orders',
  templateUrl: './seller-orders.html',
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerOrders implements OnInit {
  private readonly sellerApi = inject(SellerApiService);
  private readonly toast = inject(ToastService);

  protected readonly orders = signal<any[]>([]);
  protected readonly loading = signal(true);
  protected readonly currentPage = signal(1);
  protected readonly totalPages = signal(1);
  protected readonly totalOrders = signal(0);

  protected readonly expandedOrderId = signal<string | null>(null);
  protected readonly updatingId = signal<string | null>(null);
  protected readonly selectedStatuses = signal<Record<string, string>>({});
  protected readonly isStatusDropdownOpen = signal<string | null>(null);

  readonly allowedStatuses: OrderStatus[] = [
    'Pending',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];

  ngOnInit() {
    this.loadOrders(1);
  }

  protected loadOrders(page: number) {
    this.loading.set(true);
    this.sellerApi.getSellerOrders(page, 10).subscribe({
      next: (res: any) => {
        this.orders.set(res.data ?? []);
        this.currentPage.set(res.currentPage ?? 1);
        this.totalPages.set(res.totalPages ?? 1);
        this.totalOrders.set(res.totalOrders ?? 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected toggleExpand(orderId: string) {
    this.expandedOrderId.update((cur) => (cur === orderId ? null : orderId));
  }

  protected toggleStatusDropdown(orderId: string) {
    this.isStatusDropdownOpen.update((cur) => (cur === orderId ? null : orderId));
  }

  protected closeStatusDropdown(event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.isStatusDropdownOpen.set(null);
  }

  protected getSelectedStatus(orderId: string, currentStatus: string): string {
    return this.selectedStatuses()[orderId] ?? currentStatus;
  }

  protected setSelectedStatus(orderId: string, status: string) {
    this.selectedStatuses.update((map) => ({ ...map, [orderId]: status }));
    this.closeStatusDropdown();
  }

  protected applyStatusUpdate(orderId: string, currentStatus: string) {
    const newStatus = this.getSelectedStatus(orderId, currentStatus);
    if (newStatus === currentStatus) return;
    this.updatingId.set(orderId);
    this.sellerApi.updateSellerOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        this.orders.update((list) =>
          list.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)),
        );
        this.selectedStatuses.update((map) => {
          const next = { ...map };
          delete next[orderId];
          return next;
        });
        this.toast.success(`Order updated to ${newStatus}`);
        this.updatingId.set(null);
      },
      error: () => {
        this.toast.error('Failed to update order status');
        this.updatingId.set(null);
      },
    });
  }

  protected getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-50 text-yellow-700';
      case 'Processing':
        return 'bg-blue-50 text-blue-700';
      case 'Shipped':
        return 'bg-purple-50 text-purple-700';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700';
      case 'Cancelled':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  }

  protected getProductImg(item: any): string {
    const p = item.productId;
    if (typeof p === 'object' && p?.images?.length) {
      return p.images[0];
    }
    return '';
  }

  protected getProductName(item: any): string {
    const p = item.productId;
    if (typeof p === 'object' && p?.name) return p.name;
    return item.productTitle ?? 'Product';
  }

  protected isCompleted(status: string): boolean {
    return status === 'Delivered' || status === 'Cancelled';
  }
}
