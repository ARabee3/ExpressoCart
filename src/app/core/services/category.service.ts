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

const CATEGORY_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
];

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly apiService = inject(ApiService);

  getCategories() {
    return this.apiService.get<CategoriesResponse>('categories').pipe(map((res) => res.data));
  }

  getImageForSlug(slug: string): string {
    return CATEGORY_IMAGES[slug] ?? '';
  }

  getBackgroundForCategory(name: string, slug: string): string {
    const imageUrl = CATEGORY_IMAGES[slug];
    if (imageUrl) {
      return `url("${imageUrl}")`;
    }
    const idx = (name.charCodeAt(0) || 0) % CATEGORY_GRADIENTS.length;
    return CATEGORY_GRADIENTS[idx];
  }
}
