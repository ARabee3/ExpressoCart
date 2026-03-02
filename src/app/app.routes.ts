import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart/cart').then(m => m.Cart)
    }
];
