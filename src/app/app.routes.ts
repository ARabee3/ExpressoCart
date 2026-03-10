import { Routes } from '@angular/router';
import { checkoutGuard } from './core/guards/checkout.guard';
import { orderSuccessGuard } from './core/guards/order-success.guard';
import { sellerGuard } from './core/guards/seller-guard';

export const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin-layout/admin-layout').then((com) => com.AdminLayout),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
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
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/categories/admin-categories').then((com) => com.AdminCategories),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/users/admin-users').then((com) => com.AdminUsers),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/admin/orders/admin-orders').then((com) => com.AdminOrders),
      },
      {
        path: 'sellers',
        loadComponent: () =>
          import('./features/admin/sellers/admin-sellers').then((com) => com.AdminSellers),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./shared/components/notfound/notfound').then((com) => com.Notfound),
      },
    ],
  },
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
        loadComponent: () => import('./features/wishlist/wishlist').then((m) => m.Wishlist),
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/categories/categories').then((m) => m.Categories),
      },
      {
        path: 'about',
        loadComponent: () => import('./features/about/about').then((m) => m.About),
      },
      {
        path: 'contact-us',
        loadComponent: () => import('./features/contact-us/contact-us').then((m) => m.ContactUs),
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart/cart').then((m) => m.Cart),
      },
      {
        path: 'auth/login',
        loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.Login),
      },
      {
        path: 'auth/register',
        loadComponent: () =>
          import('./features/auth/pages/register/register').then((m) => m.Register),
      },
      {
        path: 'auth/forgot-password',
        loadComponent: () =>
          import('./features/auth/pages/forget-password/forget-password').then(
            (m) => m.ForgetPassword,
          ),
      },
      {
        path: 'auth/verify-otp',
        loadComponent: () =>
          import('./features/auth/pages/verify-otp/verify-otp').then((m) => m.VerifyOtp),
      },
      {
        path: 'checkout',
        canActivate: [checkoutGuard], // apply guard here
        loadComponent: () => import('./features/cart/checkout/checkout').then((m) => m.Checkout),
      },
      {
        path: 'checkout/success',
        canActivate: [orderSuccessGuard],
        loadComponent: () =>
          import('./features/cart/checkout/order-success/order-success').then(
            (m) => m.OrderSuccess,
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/order-history/order-history').then((m) => m.OrderHistory),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
      },
    ],
  },
  {
    path: 'seller',
    loadComponent: () =>
      import('./features/seller/seller-layout/seller-layout').then((m) => m.SellerLayout),
    canActivate: [sellerGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/seller/dashboard/seller-dashboard').then((m) => m.SellerDashboard),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/seller/products/seller-products').then((m) => m.SellerProducts),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/seller/seller-profile/seller-profile').then((m) => m.SellerProfile),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: '**',
        loadComponent: () =>
          import('./shared/components/notfound/notfound').then((com) => com.Notfound),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/notfound/notfound').then((com) => com.Notfound),
  },
];
