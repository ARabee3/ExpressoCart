# ExpressoCart - Project Guidelines

Welcome to the **ExpressoCart** project guidelines. This document serves as the single source of truth for our development standards, architectural decisions, and best practices. Adherence to these guidelines ensures code maintainability, scalability, and consistency across the team.

## 1. Project Overview

**ExpressoCart** is a modern E-commerce application built with the latest Angular ecosystem. The project emphasizes performance, modularity, and a streamlined developer experience.

### Tech Stack

- **Framework**: Angular (v20+)
- **Language**: TypeScript (v5.9+)
- **Styling**: Tailwind CSS (v4+) & SCSS
- **Build Tool**: Angular CLI (Esbuild/Vite-based builder)
- **Testing**: Jasmine & Karma

---

## 2. Architecture & File Structure

We follow a **Feature-Based Architecture**. The codebase is organized by business domain features rather than technical layers.

### Directory Structure (`src/app/`)

- **`core/`**: Singleton services, global guards, interceptors, and static models. Imported _only_ once in the root configuration.
  - `guards/`: Route guards (e.g., `AuthGuard`).
  - `interceptors/`: HTTP interceptors (e.g., `TokenInterceptor`).
  - `services/`: Global services (e.g., `AuthService`, `StorageService`).
- **`features/`**: isolated business logic. Each folder corresponds to a domain.
  - `auth/`, `admin/`, `cart/`, `products/`, `profile/`, `seller/`.
  - Each feature should be lazily loaded via `app.routes.ts`.
- **`shared/`**: Reusable UI components, pipes, and directives used across multiple features.
  - **Note**: Shared modules/components should be stateless (dumb) whenever possible.
- **`environments/`**: Environment-specific configuration (API URLs, feature flags).

---

## 3. Coding Standards

### 3.1 Naming Conventions

| Entity                | Convention                      | Example                     |
| :-------------------- | :------------------------------ | :-------------------------- |
| **Files**             | Kebab-case                      | `product-list.component.ts` |
| **Classes**           | PascalCase                      | `ProductListComponent`      |
| **Variables/Methods** | camelCase                       | `getProductDetails()`       |
| **Interfaces/Types**  | PascalCase                      | `Product`, `UserResponse`   |
| **Constants**         | UPPER_SNAKE_CASE                | `API_TIMEOUT_MS`            |
| **Observables**       | `$` Suffix                      | `products$`                 |
| **Signals**           | No specific suffix (contextual) | `products()`                |

### 3.2 Component Guidelines

- **Standalone Components**: Components are standalone by default. **Do not** add `standalone: true`.
- **Change Detection**: Always use `ChangeDetectionStrategy.OnPush` to optimize performance.
- **Logic Separation**: Delegate complex business logic to Services or Stores. Components should focus on View logic.
- **Inputs/Outputs**: Use Signal Inputs (`input()`) and Outputs (`output()`) over decorators where possible.

```typescript
// ✅ Preferred
@Component({
  selector: 'app-product-card',
  // standalone: true, // ❌ Default in v19+
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  product = input.required<Product>();
  addToCart = output<string>();
}
```

### 3.3 Styling (Tailwind CSS)

- Prefer **Tailwind utility classes** for layout, spacing, and typography.
- Use **SCSS** only for complex animations or pseudo-element trickery that Tailwind cannot easily handle.
- Follow the mobile-first approach (e.g., `w-full md:w-1/2`).

---

## 4. State Management

Given the modern Angular version, we prioritize **Signals** for local and global state management.

- **Local State**: Use `signal`, `computed`, and `effect` within components.
- **Global State**: Use Service-based state with Signals (or lightweight stores) in `core/services`.
- Avoid heavy reliance on `BehaviorSubject` unless interfacing with legacy RxJS streams.

---

## 5. Routing

- Use **Lazy Loading** for all feature routes to ensure fast initial load times.
- Define routes in `app.routes.ts` pointing to feature entry points.

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.routes').then((m) => m.PRODUCT_ROUTES),
  },
];
```

---

## 6. Git Workflow

We follow standard **Conventional Commits** for commit messages:

- `feat: ...` - A new feature
- `fix: ...` - A bug fix
- `docs: ...` - Documentation only changes
- `style: ...` - Formatting, missing semi colons, etc; no code change
- `refactor: ...` - Refactoring production code
- `test: ...` - Adding tests, refactoring test; no production code change
- `chore: ...` - Updating build tasks, package manager configs, etc

### Branching Strategy

- `master`: Production-ready code.
- `develop`: Integration branch (if applicable).
- `feature/feature-name`: New features.
- `bugfix/bug-name`: Bug fixes.

---

## 7. Performance Checklist

- [ ] Are all heavy assets optimized/lazy loaded?
- [ ] Are feature modules lazily loaded?
- [ ] Is `OnPush` change detection used?
- [ ] Are subscriptions properly unsubscribed (using `takeUntilDestroyed` or async pipe)?
- [ ] Are large lists virtualized (if applicable)?

---

## 8. Development Commands

- **Start Dev Server**: `npm start` (Runs on `http://localhost:4200`)
- **Build for Prod**: `npm run build`
- **Run Tests**: `npm test`
