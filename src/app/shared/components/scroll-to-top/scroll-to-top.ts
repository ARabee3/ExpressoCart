import { Component, ChangeDetectionStrategy, HostListener, signal } from '@angular/core';

@Component({
  selector: 'app-scroll-to-top',
  templateUrl: './scroll-to-top.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollToTop {
  readonly isVisible = signal(false);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const yOffset = window.pageYOffset || document.documentElement.scrollTop;
    this.isVisible.set(yOffset > 300);
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}
