import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shared/components/public-layout/public-layout').then((m) => m.PublicLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home/home').then((m) => m.Home),
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart/cart').then((m) => m.Cart),
      },
    ],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin-layout/admin-layout').then((com) => com.AdminLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then(
            (com) => com.DashboardComponent,
          ),
      },
    ],
  },
];
