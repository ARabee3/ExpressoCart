import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../admin';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-indigo-100 text-indigo-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

@Component({
  selector: 'app-dashboard.component',
  imports: [DatePipe, RouterLink],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  admin = inject(AdminService);

  ngOnInit(): void {
    this.admin.loadDashboardStats();
    this.admin.loadRecentOrders();
  }

  getStatusClass(status: string): string {
    return STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
  }
}
