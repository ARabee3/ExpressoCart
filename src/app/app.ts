import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('ExpressoCart');
  public readonly toastService = inject(ToastService);
}
