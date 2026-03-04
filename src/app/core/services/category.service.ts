import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Category, CategoriesResponse } from '../models/category.model';

const CATEGORY_IMAGES: Record<string, string> = {
  'living-room': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
  bedroom: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&q=80',
  office: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80',
  kitchen: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
  outdoor: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80',
  decor: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80',
  bathroom: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80',
  dining: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80',
  lighting: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
  storage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly apiService = inject(ApiService);

  getCategories() {
    return this.apiService.get<CategoriesResponse>('categories').pipe(map((res) => res.data));
  }

  getImageForSlug(slug: string): string {
    return CATEGORY_IMAGES[slug] ?? FALLBACK_IMAGE;
  }
}
