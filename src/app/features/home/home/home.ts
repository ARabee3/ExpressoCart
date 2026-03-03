import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroCarousel } from '../hero-carousel/hero-carousel';
import { TopCategories } from '../top-categories/top-categories';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [HeroCarousel, TopCategories],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {}
