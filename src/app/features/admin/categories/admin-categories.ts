import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category } from '../../../core/models/category.model';
import { AdminService } from '../admin';
import { SlugPipe } from '../../../shared/pipes/slug.pipe';

const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
];

@Component({
  selector: 'app-admin-categories',
  imports: [FormsModule, SlugPipe],
  templateUrl: './admin-categories.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCategories implements OnInit {
  admin = inject(AdminService);

  // UI state
  showForm = signal(false);
  editingCategory = signal<Category | null>(null);
  deletingCategory = signal<Category | null>(null);
  searchQuery = signal('');

  // Form model
  formName = signal('');

  // Filtered list
  filteredCategories = computed(() => {
    const categories = this.admin.categories() ?? [];
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return categories;
    return categories.filter(
      (c) => c.name.toLowerCase().includes(query) || c.slug.toLowerCase().includes(query),
    );
  });

  ngOnInit(): void {
    this.admin.loadCategories();
  }

  openCreate() {
    this.editingCategory.set(null);
    this.formName.set('');
    this.showForm.set(true);
  }

  openEdit(category: Category) {
    this.editingCategory.set(category);
    this.formName.set(category.name);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  submit() {
    const name = this.formName().trim();
    if (!name) return;

    const editing = this.editingCategory();
    if (editing) {
      this.admin.updateCategory(editing._id, { name });
    } else {
      this.admin.createCategory({ name });
    }
    this.closeForm();
  }

  confirmDelete(category: Category) {
    this.deletingCategory.set(category);
  }

  deleteConfirmed() {
    const category = this.deletingCategory();
    if (category) {
      this.admin.deleteCategory(category._id);
      this.deletingCategory.set(null);
    }
  }

  getGradient(name: string): string {
    const idx = (name.charCodeAt(0) || 0) % GRADIENTS.length;
    return GRADIENTS[idx];
  }
}
