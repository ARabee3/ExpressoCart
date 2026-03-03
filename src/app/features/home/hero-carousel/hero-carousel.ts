import {
  ChangeDetectionStrategy,
  Component,
  signal,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Slide {
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  image: string;
}

@Component({
  selector: 'app-hero-carousel',
  templateUrl: './hero-carousel.html',
  styleUrl: './hero-carousel.scss',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroCarousel implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  protected readonly currentSlide = signal(0);

  protected readonly slides = signal<Slide[]>([
    {
      title: 'Exclusive Deals of Furniture Collection',
      subtitle: 'Explore different categories. Find the best deals.',
      cta: 'Shop Now',
      ctaLink: '/products',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    },
    {
      title: 'New Arrivals This Season',
      subtitle: 'Premium quality products at unbeatable prices.',
      cta: 'Browse Collection',
      ctaLink: '/products',
      image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
    },
    {
      title: 'Transform Your Living Space',
      subtitle: 'Handpicked designs for modern homes.',
      cta: 'Discover More',
      ctaLink: '/categories',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    },
  ]);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoplay();
    }
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  goToSlide(index: number) {
    this.currentSlide.set(index);
    this.restartAutoplay();
  }

  nextSlide() {
    const next = (this.currentSlide() + 1) % this.slides().length;
    this.currentSlide.set(next);
  }

  prevSlide() {
    const prev = (this.currentSlide() - 1 + this.slides().length) % this.slides().length;
    this.currentSlide.set(prev);
  }

  private startAutoplay() {
    this.intervalId = setInterval(() => this.nextSlide(), 5000);
  }

  private stopAutoplay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private restartAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
  }
}
