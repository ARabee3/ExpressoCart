import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface Review {
  _id: string;
  review: string;
  rating: number;
  user: { _id: string; name: string } | string;
  product: string;
  createdAt?: string;
}

export interface ReviewsResponse {
  status: string;
  results: number;
  total: number;
  page: number;
  data: Review[];
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private api = inject(ApiService);

  getProductReviews(productId: string, page = 1, limit = 5): Observable<ReviewsResponse> {
    return this.api.get<ReviewsResponse>(`products/${productId}/reviews`, { page, limit });
  }

  createReview(data: { product: string; review: string; rating: number }): Observable<any> {
    return this.api.post('reviews', data);
  }
}
