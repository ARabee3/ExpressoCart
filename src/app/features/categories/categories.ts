import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';
import { Spinner } from '../../shared/components/spinner/spinner';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.html',
  imports: [RouterLink, Spinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Categories implements OnInit {
  private readonly categoryService = inject(CategoryService);

  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly categories = signal<Category[]>([]);

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.categoryService.getCategories().subscribe({
      next: (cats) => {
        this.categories.set(cats);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  getImage(slug: string): string {
    return this.categoryService.getImageForSlug(slug);
  }
}
