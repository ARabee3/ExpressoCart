import { Injectable, effect, inject, signal } from '@angular/core';
import { AuthState } from './auth-state';

export type Theme = 'default' | 'dark' | 'light' | 'creamy';

export const THEME_META: Record<Theme, { label: string; bg: string; accent: string }> = {
  default: { label: 'Default', bg: '#f0f0f0', accent: '#00466a' },
  dark: { label: 'Dark', bg: '#09090b', accent: '#6366f1' },
  light: { label: 'Light', bg: '#f4f4f5', accent: '#6366f1' },
  creamy: { label: 'Creamy', bg: '#fdf6e3', accent: '#7c5c1e' },
};

export const ALL_THEMES = Object.keys(THEME_META) as Theme[];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly authState = inject(AuthState);

  readonly currentTheme = signal<Theme>('default');

  constructor() {
    // React to user changes (login/logout) and apply the right stored theme
    effect(() => {
      const userId = this.authState.user()?._id ?? null;
      this.loadForUser(userId);
    });
  }

  setTheme(theme: Theme): void {
    const key = this.storageKey(this.authState.user()?._id ?? null);
    localStorage.setItem(key, theme);
    this.apply(theme);
  }

  private loadForUser(userId: string | null): void {
    const stored = localStorage.getItem(this.storageKey(userId)) as Theme | null;
    this.apply(stored && ALL_THEMES.includes(stored) ? stored : 'default');
  }

  private apply(theme: Theme): void {
    this.currentTheme.set(theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  private storageKey(userId: string | null): string {
    return `theme_${userId ?? 'guest'}`;
  }
}
