import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart/cart').then(m => m.Cart)
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
