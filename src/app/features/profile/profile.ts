import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface StoredUser {
  name?: string;
  email?: string;
  phone?: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile {
  private readonly authService = inject(AuthService);

  protected readonly user = signal<StoredUser>(this.loadUser());

  private loadUser(): StoredUser {
    try {
      const raw = localStorage.getItem('auth_user');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  protected getInitials(): string {
    const name = this.user().name ?? 'U';
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  logout() {
    this.authService.logout();
  }
}
