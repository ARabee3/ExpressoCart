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
        path: 'products',
        loadComponent: () =>
          import('./features/products/products/products').then((m) => m.Products),
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('./features/products/product-details/product-details').then(
            (m) => m.ProductDetails,
          ),
      },
      {
        path: 'wishlist',
        loadComponent: () =>
          import('./features/wishlist/wishlist/wishlist').then((m) => m.Wishlist),
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/categories/categories').then((m) => m.Categories),
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart/cart').then((m) => m.Cart),
      },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.Login),
      },

      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/pages/register/register').then((m) => m.Register),
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./features/cart/checkout/checkout')
            .then((m) => m.Checkout),
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
      {
        path: 'coupon',
        loadComponent: () => import('./features/admin/coupon/coupon').then((com) => com.Coupon),
      },
    ],
  },
];
