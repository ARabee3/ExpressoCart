import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService, ALL_THEMES, THEME_META, Theme } from '../../../core/services/theme.service';
import { AuthState } from '../../../core/services/auth-state';
import { AuthApi } from '../../../core/services/auth-api';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styles: ``,
})
export class AdminLayout {
  private authState = inject(AuthState);
  private authApi = inject(AuthApi);
  private router = inject(Router);

  private themeService = inject(ThemeService);
  allThemes = ALL_THEMES;
  themeMeta = THEME_META;
  currentTheme = this.themeService.currentTheme;

  setTheme(theme: Theme) {
    this.themeService.setTheme(theme);
  }

  sidebarOpen = signal(false);

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  user = this.authState.user;

  email = computed(() => this.user()?.email ?? 'admin@expresso.com');

  initial = computed(() => {
    const email = this.email();
    return email.charAt(0).toUpperCase();
  });

  displayName = computed(() => {
    const email = this.email();
    return email.split('@')[0];
  });

  role = computed(() => this.user()?.role ?? 'Admin');

  logout() {
    // this.authApi.logout().subscribe({
    //   complete: () => {
    //     this.authState.clear();
    //     this.router.navigate(['/']);
    //   },
    //   error: () => {
    //     // Still clear local state even if API call fails
    //     this.authState.clear();
    //     this.router.navigate(['/']);
    //  },
    // });
    this.authState.clear();
    this.router.navigate(['/auth/login']);
  }
}
