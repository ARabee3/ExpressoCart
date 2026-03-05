import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AdminService } from '../admin';

@Component({
  selector: 'app-dashboard.component',
  imports: [],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  admin = inject(AdminService);
  ngOnInit(): void {
    this.admin.loadDashboardStats();
  }
}
