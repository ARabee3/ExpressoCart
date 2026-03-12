import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService, ALL_THEMES, THEME_META, Theme } from '../../../core/services/theme.service';
import { AuthState } from '../../../core/services/auth-state';
import { AuthApi } from '../../../core/services/auth-api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seller-layout',
  templateUrl: './seller-layout.html',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerLayout implements OnInit {
  private readonly authState = inject(AuthState);
  private readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);

  private themeService = inject(ThemeService);
  protected allThemes = ALL_THEMES;
  protected themeMeta = THEME_META;
  protected currentTheme = this.themeService.currentTheme;

  protected setTheme(theme: Theme) {
    this.themeService.setTheme(theme);
  }

  protected readonly storeName = signal<string>('My Store');
  protected readonly sellerName = signal<string>('');
  protected readonly sidebarOpen = signal(false);

  ngOnInit() {
    this.authApi.getMe().subscribe({
      next: (res: any) => {
        this.storeName.set(res.data.storeName ?? 'My Store');
        this.sellerName.set(res.data.name ?? '');
      },
    });
  }

  protected toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }

  protected closeSidebarOnMobile() {
    this.sidebarOpen.set(false);
  }

  logout() {
    this.authState.clear();
    this.router.navigate(['/']);
  }
}
