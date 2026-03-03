import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Category {
  name: string;
  slug: string;
  image: string;
  itemCount: number;
}

@Component({
  selector: 'app-top-categories',
  templateUrl: './top-categories.html',
  styleUrl: './top-categories.scss',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopCategories {
  protected readonly categories = signal<Category[]>([
    {
      name: 'Living Room', // the name of the category
      slug: 'living-room',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80', // the images
      itemCount: 120, // will fetch the count later
    },
    {
      name: 'Bedroom',
      slug: 'bedroom',
      image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&q=80',
      itemCount: 85,
    },
    {
      name: 'Office',
      slug: 'office',
      image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80',
      itemCount: 64,
    },
    {
      name: 'Kitchen',
      slug: 'kitchen',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
      itemCount: 92,
    },
    {
      name: 'Outdoor',
      slug: 'outdoor',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&q=80',
      itemCount: 48,
    },
    {
      name: 'Decor',
      slug: 'decor',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&q=80',
      itemCount: 156,
    },
  ]);
}
