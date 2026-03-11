import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin-guard';
import { checkoutGuard } from './core/guards/checkout.guard';
import { guestGuard } from './core/guards/guest-guard';
import { orderSuccessGuard } from './core/guards/order-success.guard';
import { sellerGuard, sellerMatchGuard } from './core/guards/seller-guard';

export const routes: Routes = [
  // NOTE: seller layout MUST come before the public layout (path: '').
  // The public layout's '**' child would otherwise catch all /seller/* URLs
  // before the seller route is ever evaluated.
  // sellerMatchGuard excludes /seller/pending so it falls through to the
  // public layout (which shows it with the regular navbar, no redirect loop).
  {
    path: 'seller',
    canMatch: [sellerMatchGuard],
    canActivate: [sellerGuard],
    loadComponent: () =>
      import('./features/seller/seller-layout/seller-layout').then((m) => m.SellerLayout),
    children: [
      {
        path: 'dashboard',
        title: 'Dashboard | Expresso Seller',
        loadComponent: () =>
          import('./features/seller/dashboard/seller-dashboard').then((m) => m.SellerDashboard),
      },
      {
        path: 'products',
        title: 'My Products | Expresso Seller',
        loadComponent: () =>
          import('./features/seller/products/seller-products').then((m) => m.SellerProducts),
      },
      {
        path: 'orders',
        title: 'Orders | Expresso Seller',
        loadComponent: () =>
          import('./features/seller/orders/seller-orders').then((m) => m.SellerOrders),
      },
      {
        path: 'profile',
        title: 'Seller Profile | Expresso Seller',
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
        title: 'Not Found | Expresso',
        loadComponent: () =>
          import('./shared/components/notfound/notfound').then((com) => com.Notfound),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
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
        title: 'Dashboard | Expresso Admin',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then(
            (com) => com.DashboardComponent,
          ),
      },
      {
        path: 'coupon',
        title: 'Coupons | Expresso Admin',
        loadComponent: () => import('./features/admin/coupon/coupon').then((com) => com.Coupon),
      },
      {
        path: 'categories',
        title: 'Categories | Expresso Admin',
        loadComponent: () =>
          import('./features/admin/categories/admin-categories').then((com) => com.AdminCategories),
      },
      {
        path: 'users',
        title: 'Users | Expresso Admin',
        loadComponent: () =>
          import('./features/admin/users/admin-users').then((com) => com.AdminUsers),
      },
      {
        path: 'orders',
        title: 'Orders | Expresso Admin',
        loadComponent: () =>
          import('./features/admin/orders/admin-orders').then((com) => com.AdminOrders),
      },
      {
        path: 'sellers',
        title: 'Sellers | Expresso Admin',
        loadComponent: () =>
          import('./features/admin/sellers/admin-sellers').then((com) => com.AdminSellers),
      },
      {
        path: '**',
        title: 'Not Found | Expresso',
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
        title: 'Expresso — Home Furniture',
        loadComponent: () => import('./features/home/home/home').then((m) => m.Home),
      },
      {
        path: 'products',
        title: 'All Products | Expresso',
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
        title: 'Wishlist | Expresso',
        loadComponent: () => import('./features/wishlist/wishlist').then((m) => m.Wishlist),
      },
      {
        path: 'categories',
        title: 'Categories | Expresso',
        loadComponent: () => import('./features/categories/categories').then((m) => m.Categories),
      },
      {
        path: 'about',
        title: 'About Us | Expresso',
        loadComponent: () => import('./features/about/about').then((m) => m.About),
      },
      {
        path: 'contact-us',
        title: 'Contact Us | Expresso',
        loadComponent: () => import('./features/contact-us/contact-us').then((m) => m.ContactUs),
      },
      {
        path: 'faq',
        title: 'FAQ | Expresso',
        loadComponent: () => import('./features/faqs/faqs').then((m) => m.Faqs),
      },
      {
        path: 'shipping',
        title: 'Shipping & Returns | Expresso',
        loadComponent: () =>
          import('./features/shipping-returns/shipping-returns').then((m) => m.ShippingReturns),
      },
      {
        path: 'privacy',
        title: 'Privacy Policy | Expresso',
        loadComponent: () =>
          import('./features/privacy-policy/privacy-policy').then((m) => m.PrivacyPolicy),
      },
      {
        path: 'cart',
        title: 'My Cart | Expresso',
        loadComponent: () => import('./features/cart/cart/cart').then((m) => m.Cart),
      },
      {
        path: 'auth/login',
        title: 'Sign In | Expresso',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.Login),
      },
      {
        path: 'auth/register',
        title: 'Create Account | Expresso',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/auth/pages/register/register').then((m) => m.Register),
      },
      {
        path: 'auth/forgot-password',
        title: 'Forgot Password | Expresso',
        loadComponent: () =>
          import('./features/auth/pages/forget-password/forget-password').then(
            (m) => m.ForgetPassword,
          ),
      },
      {
        path: 'auth/verify-otp',
        title: 'Verify OTP | Expresso',
        loadComponent: () =>
          import('./features/auth/pages/verify-otp/verify-otp').then((m) => m.VerifyOtp),
      },
      {
        path: 'checkout',
        title: 'Checkout | Expresso',
        canActivate: [checkoutGuard], // apply guard here
        loadComponent: () => import('./features/cart/checkout/checkout').then((m) => m.Checkout),
      },
      {
        path: 'checkout/success',
        title: 'Order Confirmed | Expresso',
        canActivate: [orderSuccessGuard],
        loadComponent: () =>
          import('./features/cart/checkout/order-success/order-success').then(
            (m) => m.OrderSuccess,
          ),
      },
      {
        path: 'orders',
        title: 'Order History | Expresso',
        loadComponent: () =>
          import('./features/order-history/order-history').then((m) => m.OrderHistory),
      },
      {
        path: 'profile',
        title: 'My Profile | Expresso',
        loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'seller/pending',
        title: 'Pending Approval | Expresso',
        loadComponent: () =>
          import('./features/seller/pending-approval/pending-approval').then(
            (m) => m.PendingApproval,
          ),
      },
      {
        path: 'unauthorized',
        title: 'Access Denied | Expresso',
        loadComponent: () =>
          import('./shared/components/unauthorized/unauthorized').then((m) => m.Unauthorized),
      },
      {
        path: '**',
        title: 'Page Not Found | Expresso',
        loadComponent: () =>
          import('./shared/components/notfound/notfound').then((com) => com.Notfound),
      },
    ],
  },
];
