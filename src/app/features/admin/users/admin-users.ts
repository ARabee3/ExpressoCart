import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, SlicePipe } from '@angular/common';
import { User, UserRole } from '../../../core/models/user.model';
import { Order } from '../../../core/models/order.model';
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

  // UI state
  searchQuery = signal('');
  roleFilter = signal<UserRole | ''>('');
  statusFilter = signal<'all' | 'active' | 'deleted'>('all');
  deletingUser = signal<User | null>(null);
  restoringUser = signal<User | null>(null);
  viewingUser = signal<User | null>(null);
  changingRole = signal<User | null>(null);
  newRole = signal<UserRole>('Customer');

  // Filtered + searched users
  filteredUsers = computed(() => {
    const users = this.admin.users() ?? [];
    const query = this.searchQuery().toLowerCase().trim();
    const role = this.roleFilter();
    const status = this.statusFilter();
    return users.filter((u) => {
      const matchesQuery =
        !query || u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
      const matchesRole = !role || u.role === role;
      const matchesStatus =
        status === 'all' ||
        (status === 'active' && !u.isDeleted) ||
        (status === 'deleted' && u.isDeleted);
      return matchesQuery && matchesRole && matchesStatus;
    });
  });

  // Stats — use API total when available, otherwise count loaded array
  totalUsers = computed(() => this.admin.usersTotalCount() || (this.admin.users() ?? []).length);
  activeUsers = computed(
    () => (this.admin.users() ?? []).filter((u) => u.isActive && !u.isDeleted).length,
  );
  deletedUsers = computed(() => (this.admin.users() ?? []).filter((u) => u.isDeleted).length);
  sellerCount = computed(
    () => (this.admin.users() ?? []).filter((u) => u.role === 'Seller').length,
  );
  customerCount = computed(
    () => (this.admin.users() ?? []).filter((u) => u.role === 'Customer').length,
  );

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
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.admin.loadUsers(page);
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
