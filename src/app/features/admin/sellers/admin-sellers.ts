import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../../core/models/user.model';
import { AdminService } from '../admin';

type SellerStatus = 'all' | 'pending' | 'approved' | 'suspended';

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
  selector: 'app-admin-sellers',
  imports: [FormsModule],
  templateUrl: './admin-sellers.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSellers implements OnInit {
  admin = inject(AdminService);

  // UI state
  searchQuery = signal('');
  statusFilter = signal<SellerStatus>('all');
  confirmingAction = signal<{ seller: User; action: 'approve' | 'suspend' | 'reactivate' } | null>(
    null,
  );
  viewingSeller = signal<User | null>(null);

  // Derived seller status helper
  getSellerStatus(seller: User): 'pending' | 'approved' | 'suspended' {
    if (!seller.isApproved && seller.isActive) return 'pending';
    if (seller.isApproved && seller.isActive) return 'approved';
    return 'suspended';
  }

  getStatusLabel(seller: User): string {
    const status = this.getSellerStatus(seller);
    switch (status) {
      case 'pending':
        return 'Pending Approval';
      case 'approved':
        return 'Active';
      case 'suspended':
        return 'Suspended';
    }
  }

  getStatusClass(seller: User): string {
    const status = this.getSellerStatus(seller);
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'suspended':
        return 'bg-red-100 text-red-700';
    }
  }

  // Client-side filtering on all sellers (backend returns all at once)
  filteredSellers = computed(() => {
    const sellers = this.admin.sellers() ?? [];
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    return sellers.filter((s) => {
      const matchesQuery =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        (s.storeName ?? '').toLowerCase().includes(query);
      const matchesStatus = status === 'all' || this.getSellerStatus(s) === status;
      return matchesQuery && matchesStatus;
    });
  });

  // Stats
  totalSellers = computed(() => (this.admin.sellers() ?? []).length);
  pendingSellers = computed(
    () => (this.admin.sellers() ?? []).filter((s) => this.getSellerStatus(s) === 'pending').length,
  );
  activeSellers = computed(
    () => (this.admin.sellers() ?? []).filter((s) => this.getSellerStatus(s) === 'approved').length,
  );
  suspendedSellers = computed(
    () =>
      (this.admin.sellers() ?? []).filter((s) => this.getSellerStatus(s) === 'suspended').length,
  );

  // Client-side pagination on the filtered results
  readonly itemsPerPage = 10;
  currentPage = signal(1);

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredSellers().length / this.itemsPerPage)),
  );

  paginatedSellers = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredSellers().slice(start, start + this.itemsPerPage);
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    let start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.currentPage.set(page);
  }

  ngOnInit(): void {
    this.admin.loadSellers();
  }

  // --- Search & filter handlers ---

  onSearchInput(value: string) {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  onStatusFilterChange(value: SellerStatus) {
    this.statusFilter.set(value);
    this.currentPage.set(1);
  }

  // Gradient avatar
  getGradient(name: string): string {
    const idx = (name.charCodeAt(0) || 0) % GRADIENTS.length;
    return GRADIENTS[idx];
  }

  // Actions
  openConfirm(seller: User, action: 'approve' | 'suspend' | 'reactivate') {
    this.confirmingAction.set({ seller, action });
  }

  confirmAction() {
    const data = this.confirmingAction();
    if (!data) return;

    switch (data.action) {
      case 'approve':
        this.admin.approveSeller(data.seller._id);
        break;
      case 'suspend':
        this.admin.suspendSeller(data.seller._id);
        break;
      case 'reactivate':
        this.admin.reactivateSeller(data.seller._id);
        break;
    }
    this.confirmingAction.set(null);
  }

  cancelConfirm() {
    this.confirmingAction.set(null);
  }

  viewSeller(seller: User) {
    this.viewingSeller.set(seller);
  }

  closeSellerPanel() {
    this.viewingSeller.set(null);
  }

  getActionLabel(action: string): string {
    switch (action) {
      case 'approve':
        return 'Approve';
      case 'suspend':
        return 'Suspend';
      case 'reactivate':
        return 'Reactivate';
      default:
        return action;
    }
  }

  getActionColor(action: string): string {
    switch (action) {
      case 'approve':
        return 'bg-green-600 hover:bg-green-700';
      case 'suspend':
        return 'bg-red-600 hover:bg-red-700';
      case 'reactivate':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  }
}
