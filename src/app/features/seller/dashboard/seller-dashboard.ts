import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SellerApiService } from '../../../core/services/seller-api.service';
import { AuthState } from '../../../core/services/auth-state';

@Component({
  selector: 'app-seller-dashboard',
  templateUrl: './seller-dashboard.html',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerDashboard implements OnInit {
  private readonly sellerApi = inject(SellerApiService);
  private readonly authState = inject(AuthState);

  protected readonly totalProducts = signal<number>(0);
  protected readonly recentProducts = signal<any[]>([]);
  protected readonly loading = signal(true);
  protected readonly showWelcome = signal(false);

  ngOnInit() {
    this.checkWelcomeBanner();
    this.loadStats();
  }

  private checkWelcomeBanner() {
    const userId = this.authState.user()?._id;
    if (!userId) return;
    const key = `seller_welcomed_${userId}`;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, '1');
      this.showWelcome.set(true);
    }
  }

  private loadStats() {
    this.sellerApi.getMyProducts(1, 5).subscribe({
      next: (res: any) => {
        this.totalProducts.set(res.totalProducts ?? 0);
        this.recentProducts.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  protected dismissWelcome() {
    this.showWelcome.set(false);
  }
}
