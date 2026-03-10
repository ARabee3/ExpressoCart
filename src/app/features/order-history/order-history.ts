import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, SlicePipe, CurrencyPipe, LowerCasePipe, UpperCasePipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { Order, OrderStatus } from '../../core/models/order.model';

type FilterTab = 'All' | OrderStatus;

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.html',
  imports: [RouterLink, DatePipe, SlicePipe, CurrencyPipe, LowerCasePipe, UpperCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderHistory implements OnInit {
  private readonly orderService = inject(OrderService);

  protected readonly orders = signal<Order[]>([]);
  protected readonly loading = signal(true);
  protected readonly activeTab = signal<FilterTab>('All');
  protected readonly expandedOrderId = signal<string | null>(null);

  protected readonly tabs: FilterTab[] = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  protected readonly filteredOrders = computed(() => {
    const tab = this.activeTab();
    const all = this.orders();
    if (tab === 'All') return all;
    return all.filter((o) => o.status === tab);
  });

  protected readonly statusCounts = computed(() => {
    const all = this.orders();
    const counts: Record<string, number> = { All: all.length };
    for (const tab of this.tabs) {
      if (tab !== 'All') counts[tab] = all.filter((o) => o.status === tab).length;
    }
    return counts;
  });

  ngOnInit() {
    this.orderService.getMyOrders().subscribe({
      next: (res) => {
        this.orders.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  protected setTab(tab: FilterTab) {
    this.activeTab.set(tab);
  }

  protected toggleOrder(orderId: string) {
    this.expandedOrderId.update((current) => (current === orderId ? null : orderId));
  }

  protected isExpanded(orderId: string): boolean {
    return this.expandedOrderId() === orderId;
  }

  protected getStatusClass(status: OrderStatus): string {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Processing':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Shipped':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-600 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border border-gray-200';
    }
  }

  protected getStatusDotClass(status: OrderStatus): string {
    switch (status) {
      case 'Pending':
        return 'bg-amber-400';
      case 'Processing':
        return 'bg-blue-500';
      case 'Shipped':
        return 'bg-indigo-500';
      case 'Delivered':
        return 'bg-emerald-500';
      case 'Cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  }

  protected getPaymentIcon(method: string): string {
    switch (method) {
      case 'Card':
        return '💳';
      case 'Cash':
        return '💵';
      case 'Wallet':
        return '👛';
      default:
        return '💰';
    }
  }

  protected getTimelineSteps(order: Order) {
    const steps = [
      { label: 'Ordered', date: order.createdAt, active: true, color: 'bg-brand-accent' },
      {
        label: 'Processing',
        date: order.processedAt,
        active: !!order.processedAt,
        color: 'bg-blue-500',
      },
      {
        label: 'Shipped',
        date: order.shippedAt,
        active: !!order.shippedAt,
        color: 'bg-indigo-500',
      },
      {
        label: 'Delivered',
        date: order.deliveredAt,
        active: !!order.deliveredAt,
        color: 'bg-emerald-500',
      },
    ];

    if (order.cancelledAt) {
      return [
        steps[0],
        {
          label: 'Cancelled',
          date: order.cancelledAt,
          active: true,
          color: 'bg-red-500',
        },
      ];
    }

    return steps;
  }
}
