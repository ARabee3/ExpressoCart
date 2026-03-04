import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, map, catchError, forkJoin } from 'rxjs';
import { Product } from '../models/cart.model';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment.development';

interface ProductsApiResponse {
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  products: Product[];
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = inject(ApiService);
  private readonly baseUrl = environment.apiUrl;

  /** Normalize API product — category may be populated object { _id, name, slug } */
  private normalizeProduct(p: Product): Product {
    const normalized = { ...p };

    // Normalize category object to string
    if (normalized.category && typeof normalized.category === 'object') {
      normalized.category = (normalized.category as any).name ?? '';
    }

    // Fix relative image paths
    if (normalized.images?.length) {
      normalized.images = normalized.images.map((img) =>
        img.startsWith('http') ? img : `${this.baseUrl}/${img}`,
      );
    }

    return normalized;
  }

  private readonly MOCK_PRODUCTS: Product[] = [
    {
      _id: 'prod_1',
      name: 'Gradient Graphic T-shirt',
      price: 145,
      stock: 50,
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop'],
      description: 'A stylish gradient t-shirt',
      category: 'Decor',
      sellerId: { name: 'Dummy Data' },
    },
    {
      _id: 'prod_2',
      name: 'Checkered Shirt',
      price: 180,
      stock: 30,
      images: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=300&h=300&fit=crop'],
      description: 'Red checkered shirt',
      category: 'Decor',
      sellerId: { name: 'Dummy Data' },
    },
    {
      _id: 'prod_3',
      name: 'Skinny Fit Jeans',
      price: 240,
      stock: 25,
      images: ['https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=300&h=300&fit=crop'],
      description: 'Blue skinny jeans',
      category: 'Decor',
      sellerId: { name: 'Dummy Data' },
    },
    {
      _id: 'prod_4',
      name: 'Modern Accent Chair',
      price: 320,
      stock: 15,
      images: ['https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=300&fit=crop'],
      description: 'A modern accent chair for any room',
      category: 'Living Room',
      sellerId: { name: 'Dummy Data' },
    },
    {
      _id: 'prod_5',
      name: 'Wooden Coffee Table',
      price: 150,
      stock: 0,
      images: ['https://images.unsplash.com/photo-1533090481728-8b596af05686?w=300&h=300&fit=crop'],
      description: 'Minimalist wooden coffee table',
      category: 'Living Room',
      sellerId: { name: 'Dummy Data' },
    },
    {
      _id: 'prod_6',
      name: 'Decorative Vase',
      price: 45,
      stock: 100,
      images: ['https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=300&h=300&fit=crop'],
      description: 'Hand-crafted ceramic vase',
      category: 'Decor',
      sellerId: { name: 'Dummy Data' },
    },
    {
      _id: 'prod_7',
      name: 'Lounge Sofa',
      price: 890,
      stock: 5,
      images: ['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=300&h=300&fit=crop'],
      description: 'Comfortable 3-seater lounge sofa',
      category: 'Living Room',
      sellerId: { name: 'Dummy Data' },
    },
    {
      _id: 'prod_8',
      name: 'Office Desk',
      price: 260,
      stock: 12,
      images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=300&h=300&fit=crop'],
      description: 'Spacious home office desk',
      category: 'Office',
      sellerId: { name: 'Dummy Data' },
    },
    {
      _id: 'prod_9',
      name: 'Outdoor Patio Set',
      price: 650,
      stock: 8,
      images: ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=300&h=300&fit=crop'],
      description: 'Durable outdoor patio seating',
      category: 'Outdoor',
      sellerId: { name: 'Dummy Data' },
    },
    {
      _id: 'prod_10',
      name: 'King Size Bed Frame',
      price: 499,
      stock: 4,
      images: ['https://images.unsplash.com/photo-1505693314120-0d443867891c?w=300&h=300&fit=crop'],
      description: 'Sturdy wooden bed frame',
      category: 'Bedroom',
      sellerId: { name: 'Dummy Data' },
    },
  ];

  getProducts(): Observable<Product[]> {
    return forkJoin({
      apiProducts: this.api.get<ProductsApiResponse>('products', { limit: 100 }).pipe(
        map((res) => (res.products ?? []).map((p) => this.normalizeProduct(p))),
        catchError(() => of([])),
      ),
      mockProducts: of(this.MOCK_PRODUCTS),
    }).pipe(map(({ apiProducts, mockProducts }) => [...apiProducts, ...mockProducts]));
  }

  getProductById(id: string): Observable<Product | undefined> {
    if (id.startsWith('prod_')) {
      const product = this.MOCK_PRODUCTS.find((p) => p._id === id);
      return of(product).pipe(delay(300));
    }
    return this.api.get<{ data: Product }>(`products/${id}`).pipe(
      map((res) => res.data),
      catchError(() => of(undefined)),
    );
  }

  searchProducts(keyword: string): Observable<Product[]> {
    return forkJoin({
      apiProducts: this.api.get<ProductsApiResponse>('products', { keyword }).pipe(
        map((res) => (res.products ?? []).map((p) => this.normalizeProduct(p))),
        catchError(() => of([])),
      ),
      mockProducts: of(
        this.MOCK_PRODUCTS.filter((p) => {
          const search = keyword.toLowerCase();
          const sellerName = typeof p.sellerId === 'object' ? p.sellerId?.name : '';
          return (
            p.name.toLowerCase().includes(search) ||
            p.description.toLowerCase().includes(search) ||
            (p.category && p.category.toLowerCase().includes(search)) ||
            (sellerName && sellerName.toLowerCase().includes(search))
          );
        }),
      ),
    }).pipe(map(({ apiProducts, mockProducts }) => [...apiProducts, ...mockProducts]));
  }
}
