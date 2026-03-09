import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SellerApiService } from '../../../core/services/seller-api.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-seller-products',
  templateUrl: './seller-products.html',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerProducts implements OnInit {
  private readonly sellerApi = inject(SellerApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly products = signal<any[]>([]);
  protected readonly categories = signal<any[]>([]);
  protected readonly loading = signal(true);
  protected readonly totalProducts = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly currentPage = signal(1);

  // Add modal
  protected readonly showAddModal = signal(false);
  protected readonly addModalVisible = signal(false);
  protected readonly addSubmitting = signal(false);
  protected readonly addImageFiles = signal<File[]>([]);
  protected readonly addImagePreviews = signal<string[]>([]);

  // Edit modal
  protected readonly showEditModal = signal(false);
  protected readonly editModalVisible = signal(false);
  protected readonly editSubmitting = signal(false);
  protected readonly selectedProduct = signal<any>(null);

  // Delete confirm
  protected readonly deleteConfirmId = signal<string | null>(null);
  protected readonly deleting = signal(false);

  // Custom category dropdowns
  protected readonly addCategoryOpen = signal(false);
  protected readonly editCategoryOpen = signal(false);

  protected getCategoryName(formType: 'add' | 'edit'): string {
    const id = (formType === 'add' ? this.addForm : this.editForm).get('category')?.value;
    return this.categories().find((c) => c._id === id)?.name ?? 'Select a category';
  }

  protected selectCategory(formType: 'add' | 'edit', id: string) {
    (formType === 'add' ? this.addForm : this.editForm).get('category')?.setValue(id);
    (formType === 'add' ? this.addCategoryOpen : this.editCategoryOpen).set(false);
  }

  protected readonly addForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.min(0)]],
    category: ['', Validators.required],
  });

  protected readonly editForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.min(0)]],
    category: ['', Validators.required],
  });

  ngOnInit() {
    this.loadProducts();
    this.sellerApi.getCategories().subscribe({
      next: (res: any) => this.categories.set(res.data ?? []),
    });
  }

  protected loadProducts(page = 1) {
    this.loading.set(true);
    this.sellerApi.getMyProducts(page, 10).subscribe({
      next: (res: any) => {
        this.products.set(res.data ?? []);
        this.totalProducts.set(res.totalProducts ?? 0);
        this.totalPages.set(res.totalPages ?? 1);
        this.currentPage.set(res.currentPage ?? 1);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // ---- Add ----
  protected openAddModal() {
    this.addForm.reset({ stock: 0 });
    this.addImageFiles.set([]);
    this.addImagePreviews.set([]);
    this.showAddModal.set(true);
    setTimeout(() => this.addModalVisible.set(true), 10);
  }

  protected closeAddModal() {
    this.addModalVisible.set(false);
    setTimeout(() => this.showAddModal.set(false), 300);
  }

  protected onAddImagesChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const files = Array.from(input.files).slice(0, 5);
    this.addImageFiles.set(files);
    const previews = files.map((f) => URL.createObjectURL(f));
    this.addImagePreviews.set(previews);
  }

  protected submitAdd() {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    if (this.addImageFiles().length === 0) {
      this.toast.error('Please select at least one product image');
      return;
    }
    this.addSubmitting.set(true);
    const fd = new FormData();
    const v = this.addForm.value;
    fd.append('name', v.name!);
    fd.append('description', v.description!);
    fd.append('price', String(v.price!));
    fd.append('stock', String(v.stock ?? 0));
    fd.append('category', v.category!);
    this.addImageFiles().forEach((f) => fd.append('images', f));

    this.sellerApi.createProduct(fd).subscribe({
      next: () => {
        this.addSubmitting.set(false);
        this.closeAddModal();
        this.toast.success('Product added successfully!');
        this.loadProducts(this.currentPage());
      },
      error: () => this.addSubmitting.set(false),
    });
  }

  // ---- Edit ----
  protected openEditModal(product: any) {
    this.selectedProduct.set(product);
    this.editForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category?._id ?? product.category,
    });
    this.showEditModal.set(true);
    setTimeout(() => this.editModalVisible.set(true), 10);
  }

  protected closeEditModal() {
    this.editModalVisible.set(false);
    setTimeout(() => {
      this.showEditModal.set(false);
      this.selectedProduct.set(null);
    }, 300);
  }

  protected submitEdit() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.editSubmitting.set(true);
    const id = this.selectedProduct()._id;
    this.sellerApi.updateProduct(id, this.editForm.value).subscribe({
      next: () => {
        this.editSubmitting.set(false);
        this.closeEditModal();
        this.toast.success('Product updated successfully!');
        this.loadProducts(this.currentPage());
      },
      error: () => this.editSubmitting.set(false),
    });
  }

  // ---- Delete ----
  protected requestDelete(id: string) {
    this.deleteConfirmId.set(id);
  }

  protected cancelDelete() {
    this.deleteConfirmId.set(null);
  }

  protected confirmDelete(id: string) {
    this.deleting.set(true);
    this.sellerApi.deleteProduct(id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteConfirmId.set(null);
        this.toast.success('Product deleted');
        const page =
          this.products().length === 1 && this.currentPage() > 1
            ? this.currentPage() - 1
            : this.currentPage();
        this.loadProducts(page);
      },
      error: () => this.deleting.set(false),
    });
  }

  protected pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  protected fieldError(form: 'add' | 'edit', field: string, error: string): boolean {
    const ctrl = (form === 'add' ? this.addForm : this.editForm).get(field);
    return !!(ctrl?.touched && ctrl.errors?.[error]);
  }
}
