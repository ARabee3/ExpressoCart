import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
import { ScrollToTop } from '../scroll-to-top/scroll-to-top';

@Component({
  selector: 'app-public-layout',
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.scss',
  imports: [RouterOutlet, Navbar, Footer, ScrollToTop],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicLayout {}
