import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-top-categories',
  templateUrl: './top-categories.html',
  styleUrl: './top-categories.scss',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopCategories implements OnInit {
  private readonly categoryService = inject(CategoryService);

  protected readonly isLoading = signal(true);
  protected readonly categories = signal<Category[]>([]);

  ngOnInit() {
    this.categoryService.getCategories().subscribe({
      next: (cats) => {
        this.categories.set(cats.slice(0, 6));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  getImage(slug: string): string {
    return this.categoryService.getImageForSlug(slug);
  }
}
