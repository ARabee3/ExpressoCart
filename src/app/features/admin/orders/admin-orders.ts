import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, SlicePipe, CurrencyPipe } from '@angular/common';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { AdminService } from '../admin';

const STATUS_COLORS: Record<OrderStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-indigo-100 text-indigo-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const PAYMENT_COLORS: Record<string, string> = {
  Card: 'bg-purple-100 text-purple-700',
  Cash: 'bg-amber-100 text-amber-700',
  Wallet: 'bg-teal-100 text-teal-700',
};

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Pending: ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: [],
  Cancelled: [],
};

@Component({
  selector: 'app-admin-orders',
  imports: [FormsModule, DatePipe, SlicePipe],
  templateUrl: './admin-orders.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrders implements OnInit {
  admin = inject(AdminService);

  // UI state
  statusFilter = signal<OrderStatus | ''>('');
  viewingOrder = signal<Order | null>(null);
  updatingStatus = signal<Order | null>(null);
  newStatus = signal<OrderStatus>('Processing');
  deletingOrder = signal<Order | null>(null);

  // Client-side filter on current page
  filteredOrders = computed(() => {
    const orders = this.admin.orders() ?? [];
    const status = this.statusFilter();
    if (!status) return orders;
    return orders.filter((o) => o.status === status);
  });

  // Pagination
  currentPage = computed(() => this.admin.ordersCurrentPage());
  totalPages = computed(() => this.admin.ordersTotalPages());
  totalOrders = computed(() => this.admin.ordersTotalCount());

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    let start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  ngOnInit(): void {
    this.admin.loadOrders();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.admin.loadOrders(page);
  }

  getStatusClass(status: string): string {
    return STATUS_COLORS[status as OrderStatus] || 'bg-gray-100 text-gray-700';
  }

  getPaymentClass(method: string): string {
    return PAYMENT_COLORS[method] || 'bg-gray-100 text-gray-700';
  }

  getAllowedTransitions(status: OrderStatus): OrderStatus[] {
    return ALLOWED_TRANSITIONS[status] || [];
  }

  // View order detail
  viewOrder(order: Order) {
    this.viewingOrder.set(order);
    // Load fresh data from API
    this.admin.getOrder(order._id);
  }

  closeOrderPanel() {
    this.viewingOrder.set(null);
    this.admin.selectedOrder.set(null);
  }

  // Status update
  openStatusUpdate(order: Order) {
    const transitions = this.getAllowedTransitions(order.status);
    if (transitions.length === 0) return;
    this.updatingStatus.set(order);
    this.newStatus.set(transitions[0]);
  }

  confirmStatusUpdate() {
    const order = this.updatingStatus();
    if (order) {
      this.admin.updateOrderStatus(order._id, this.newStatus());
      this.updatingStatus.set(null);
    }
  }

  // Delete (cancelled only)
  confirmDelete(order: Order) {
    this.deletingOrder.set(order);
  }

  deleteConfirmed() {
    const order = this.deletingOrder();
    if (order) {
      this.admin.deleteOrder(order._id);
      this.deletingOrder.set(null);
      if (this.viewingOrder()?._id === order._id) {
        this.closeOrderPanel();
      }
    }
  }
}
