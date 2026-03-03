import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  protected readonly currentYear = new Date().getFullYear();

  protected readonly quickLinks = [
    { label: 'Home', route: '/' },
    { label: 'Products', route: '/products' },
    { label: 'Categories', route: '/categories' },
    { label: 'About', route: '/about' },
  ];

  protected readonly supportLinks = [
    { label: 'Contact Us', route: '/contact' },
    { label: 'FAQs', route: '/faq' },
    { label: 'Shipping & Returns', route: '/shipping' },
    { label: 'Privacy Policy', route: '/privacy' },
  ];
}
