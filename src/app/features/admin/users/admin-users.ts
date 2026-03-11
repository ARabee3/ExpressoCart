import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, SlicePipe } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { User, UserRole } from '../../../core/models/user.model';
import { AdminService } from '../admin';

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

const ROLE_COLORS: Record<UserRole, string> = {
  Admin: 'bg-purple-100 text-purple-700',
  Seller: 'bg-blue-100 text-blue-700',
  Customer: 'bg-gray-100 text-gray-700',
};

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-indigo-100 text-indigo-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

@Component({
  selector: 'app-admin-users',
  imports: [FormsModule, DatePipe, SlicePipe],
  templateUrl: './admin-users.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsers implements OnInit {
  admin = inject(AdminService);
  private destroyRef = inject(DestroyRef);

  // UI state
  searchQuery = signal('');
  roleFilter = signal<UserRole | ''>('');
  statusFilter = signal<'all' | 'active' | 'deleted'>('all');
  sortField = signal<'newest' | 'name' | 'role'>('newest');
  deletingUser = signal<User | null>(null);
  restoringUser = signal<User | null>(null);
  viewingUser = signal<User | null>(null);
  changingRole = signal<User | null>(null);
  newRole = signal<UserRole>('Customer');

  // Debounced search — triggers loading all users for client-side search
  private searchSubject$ = new Subject<string>();

  /** Whether we're in filtered mode (showing client-side results across all users) */
  isFiltering = computed(
    () =>
      this.admin.allUsers() !== null || // once all users loaded, always use client-side path
      this.searchQuery().trim().length > 0 ||
      this.roleFilter() !== '' ||
      this.statusFilter() !== 'all' ||
      this.sortField() !== 'newest',
  );

  constructor() {
    this.searchSubject$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => {
        if (query.trim()) {
          // Trigger loading all users for client-side search
          this.admin.loadAllUsers();
        }
      });
  }

  // Search/filter results: filter ALL users client-side when searching or filtering
  searchResults = computed(() => {
    const allUsers = this.admin.allUsers() ?? [];
    const query = this.searchQuery().toLowerCase().trim();
    const role = this.roleFilter();
    const status = this.statusFilter();
    const filtered = allUsers.filter((u) => {
      const matchesQuery =
        !query || u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
      const matchesRole = !role || u.role === role;
      const matchesStatus =
        status === 'all' ||
        (status === 'active' && !u.isDeleted) ||
        (status === 'deleted' && u.isDeleted);
      return matchesQuery && matchesRole && matchesStatus;
    });
    return this.applySort(filtered);
  });

  // Paginated view of the current page (non-search mode)
  filteredUsers = computed(() => {
    const users = this.admin.users() ?? [];
    const role = this.roleFilter();
    const status = this.statusFilter();
    const filtered = users.filter((u) => {
      const matchesRole = !role || u.role === role;
      const matchesStatus =
        status === 'all' ||
        (status === 'active' && !u.isDeleted) ||
        (status === 'deleted' && u.isDeleted);
      return matchesRole && matchesStatus;
    });
    return this.applySort(filtered);
  });

  private applySort(users: User[]): User[] {
    const sort = this.sortField();
    const newestOf = (u: User) => parseInt(u._id.substring(0, 8), 16);
    return [...users].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'role') return a.role.localeCompare(b.role);
      return newestOf(b) - newestOf(a); // newest first
    });
  }

  // Client-side pagination for search results
  readonly searchItemsPerPage = 10;
  searchPage = signal(1);
  searchTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.searchResults().length / this.searchItemsPerPage)),
  );
  paginatedSearchResults = computed(() => {
    const start = (this.searchPage() - 1) * this.searchItemsPerPage;
    return this.searchResults().slice(start, start + this.searchItemsPerPage);
  });
  searchPageNumbers = computed(() => {
    const total = this.searchTotalPages();
    const current = this.searchPage();
    const pages: number[] = [];
    let start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  // Stats — when filtering/searching, derive from searchResults; otherwise from current page
  private statsSource = computed(() =>
    this.isFiltering() ? this.searchResults() : (this.admin.users() ?? []),
  );
  totalUsers = computed(() => {
    if (this.isFiltering()) return this.searchResults().length;
    return this.admin.usersTotalCount() || (this.admin.users() ?? []).length;
  });
  activeUsers = computed(() => this.statsSource().filter((u) => u.isActive && !u.isDeleted).length);
  deletedUsers = computed(() => this.statsSource().filter((u) => u.isDeleted).length);
  sellerCount = computed(() => this.statsSource().filter((u) => u.role === 'Seller').length);
  customerCount = computed(() => this.statsSource().filter((u) => u.role === 'Customer').length);

  // Pagination helpers
  currentPage = computed(() => this.admin.usersCurrentPage());
  totalPages = computed(() => this.admin.usersTotalPages());
  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    // Show max 5 page numbers centered around current
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);
    start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  ngOnInit(): void {
    this.admin.loadUsers();
    this.admin.loadAllUsers(); // pre-load for client-side sort/filter
  }

  // --- Search & filter handlers ---

  onSearchInput(value: string) {
    this.searchQuery.set(value);
    this.searchPage.set(1);
    this.searchSubject$.next(value);
  }

  onRoleFilterChange(value: UserRole | '') {
    this.roleFilter.set(value);
    this.searchPage.set(1);
    // Load all users for client-side filtering if a filter is active
    if (value) this.admin.loadAllUsers();
  }

  onStatusFilterChange(value: 'all' | 'active' | 'deleted') {
    this.statusFilter.set(value);
    this.searchPage.set(1);
    // Load all users for client-side filtering if a filter is active
    if (value !== 'all') this.admin.loadAllUsers();
  }

  onSortChange(value: 'newest' | 'name' | 'role') {
    this.sortField.set(value);
    this.searchPage.set(1);
    this.admin.loadAllUsers();
  }

  goToPage(page: number) {
    if (this.isFiltering()) {
      // Client-side pagination for search/filter
      if (page < 1 || page > this.searchTotalPages() || page === this.searchPage()) return;
      this.searchPage.set(page);
    } else {
      // Server-side pagination for normal browsing
      if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
      this.admin.loadUsers(page);
    }
  }

  // Gradient avatar
  getGradient(name: string): string {
    const idx = (name.charCodeAt(0) || 0) % GRADIENTS.length;
    return GRADIENTS[idx];
  }

  getRoleClass(role: UserRole): string {
    return ROLE_COLORS[role] || 'bg-gray-100 text-gray-700';
  }

  getStatusClass(status: string): string {
    return STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
  }

  // View user details + orders
  viewUser(user: User) {
    this.viewingUser.set(user);
    this.admin.loadUserOrders(user._id);
  }

  closeUserPanel() {
    this.viewingUser.set(null);
    this.admin.selectedUserOrders.set(null);
  }

  // Role change
  openRoleChange(user: User) {
    this.changingRole.set(user);
    this.newRole.set(user.role);
  }

  confirmRoleChange() {
    const user = this.changingRole();
    if (user && this.newRole() !== user.role) {
      this.admin.updateUserRole(user._id, this.newRole());
    }
    this.changingRole.set(null);
  }

  // Delete (soft)
  confirmDelete(user: User) {
    this.deletingUser.set(user);
  }

  deleteConfirmed() {
    const user = this.deletingUser();
    if (user) {
      this.admin.deleteUser(user._id);
      this.deletingUser.set(null);
    }
  }

  // Restore
  confirmRestore(user: User) {
    this.restoringUser.set(user);
  }

  restoreConfirmed() {
    const user = this.restoringUser();
    if (user) {
      this.admin.restoreUser(user._id);
      this.restoringUser.set(null);
    }
  }
}
