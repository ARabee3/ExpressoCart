import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { AdminStats } from '../../core/models/admin-stats.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = inject(ApiService);

  stats = signal<AdminStats | null>(null);

  loadDashboardStats() {
    this.api.get<{ data: AdminStats }>('admin/dashboard-stats').subscribe((response) => {
      this.stats.set(response.data);
    });
  }
}
