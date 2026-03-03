import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ToastService, ToastType } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  imports: [NgClass],
  templateUrl: './toast.html',
})
export class ToastComponent {
  toast = inject(ToastService);

  iconFor(type: ToastType): string {
    return { success: '✓', error: '✕', warning: '!', info: 'i' }[type];
  }

  borderFor(type: ToastType): string {
    return {
      success: 'border-green-500',
      error: 'border-red-500',
      warning: 'border-yellow-500',
      info: 'border-blue-500',
    }[type];
  }

  iconBgFor(type: ToastType): string {
    return {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500',
    }[type];
  }
}
