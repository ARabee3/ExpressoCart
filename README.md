# ExpressoCart

A full-featured, modern e-commerce single-page application built with **Angular 21** and backed by an **Express.js** REST API. ExpressoCart supports three distinct user roles — Customer, Seller, and Admin — each with a tailored interface and permission set.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
  - [Authentication & Authorization](#authentication--authorization)
  - [Customer Features](#customer-features)
  - [Seller Portal](#seller-portal)
  - [Admin Panel](#admin-panel)
  - [UI & UX](#ui--ux)
- [Architecture](#architecture)
  - [Project Structure](#project-structure)
  - [Routing & Lazy Loading](#routing--lazy-loading)
  - [State Management](#state-management)
  - [HTTP Interceptors](#http-interceptors)
  - [Route Guards](#route-guards)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Environment Configuration](#environment-configuration)
- [Deployment](#deployment)

---

## Tech Stack

| Layer      | Technology                                        |
| ---------- | ------------------------------------------------- |
| Framework  | Angular 21 (standalone components)                |
| Language   | TypeScript 5.9+                                   |
| Styling    | Tailwind CSS v4 + SCSS                            |
| State      | Angular Signals + service-based stores            |
| HTTP       | Angular `HttpClient` with functional interceptors |
| Payments   | Stripe.js (`@stripe/stripe-js`)                   |
| Auth       | JWT (access + refresh token) + Google OAuth       |
| Markdown   | `marked` / `ngx-markdown` (chatbot responses)     |
| Testing    | Jasmine + Karma                                   |
| Build      | Angular CLI (Esbuild / Vite)                      |
| Deployment | Vercel (with `vercel.json` SPA rewrite rules)     |

---

## Features

### Authentication & Authorization

- **Local auth** — register with email/password/phone, OTP email verification flow
- **Google OAuth** — one-click sign-in via Google ID token
- **JWT refresh** — silent access-token renewal via a dedicated `/refresh` endpoint; concurrent requests are queued and replayed once the new token is available (no double-refresh race condition)
- **Forgot password** — OTP-based reset flow (request OTP → verify → set new password)
- **Three roles** — `Customer`, `Seller`, `Admin`, each decoded directly from the JWT payload using `jwt-decode`
- **Guest cart** — anonymous users can shop; the guest `sessionId` cart is merged into their account on login

### Customer Features

| Feature                                        | Details                                                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Home**                                       | Hero carousel, top categories, explore-categories section, benefits strip                              |
| **Product catalogue**                          | Browse all products with search, category filter, and pagination                                       |
| **Product details**                            | Image gallery, description, stock info, add-to-cart, add-to-wishlist, reviews & ratings                |
| **Reviews**                                    | Authenticated users can create, edit, and delete their own reviews (1–5 stars)                         |
| **Cart**                                       | Add / update / remove items; coupon code application; real-time price recalculation                    |
| **Wishlist**                                   | Save products for later; toggle from any product card                                                  |
| **Checkout**                                   | Select/add shipping address, choose payment method (Card via Stripe or Cash on Delivery)               |
| **Stripe payments**                            | Card details modal powered by Stripe.js; webhook confirms payment server-side                          |
| **Order success**                              | Guard-protected confirmation page (prevents direct URL access)                                         |
| **Order history**                              | Full list of past orders with status tracking (Pending → Processing → Shipped → Delivered / Cancelled) |
| **Profile**                                    | View/edit name and phone; manage multiple shipping addresses (set default, add, delete)                |
| **Categories**                                 | Browse all product categories in a dedicated page                                                      |
| **Contact / FAQ / About / Shipping / Privacy** | Static informational pages                                                                             |

### Seller Portal

Accessible at `/seller/*`, guarded so only approved, active sellers may enter.

- **Dashboard** — overview stats for the seller's store
- **Products** — full CRUD: create listings with image uploads, edit price/stock/description, delete
- **Orders** — view and manage orders for the seller's products
- **Profile** — update seller store details
- **Pending approval** — sellers awaiting admin review see a dedicated holding page (no redirect loop)

### Admin Panel

Accessible at `/admin/*`, restricted to the `Admin` role.

- **Dashboard** — platform-wide stats (users, orders, revenue, products, sellers)
- **Users** — list all customers; soft-delete accounts
- **Sellers** — approve / suspend seller accounts
- **Orders** — view all orders; update order status
- **Categories** — create, update, and delete product categories
- **Coupons** — create percentage or fixed-amount coupons with expiry dates, usage limits, and active/inactive toggle

### UI & UX

- **Theme switcher** — four themes (Default, Dark, Light, Creamy) persisted per user in localStorage; changes apply instantly via `data-theme` attribute on `<html>`
- **AI Chatbot** — floating assistant that renders markdown responses using `ngx-markdown`
- **Toast notifications** — non-blocking success/error/info toasts via a singleton `ToastService`
- **Global spinner** — full-page loading indicator hooked into the HTTP lifecycle
- **Scroll to top** — smooth scroll button that appears on long pages
- **Responsive design** — mobile-first layouts with Tailwind CSS breakpoints
- **404 / 401 pages** — dedicated Not Found and Unauthorized components
- **Conventional page titles** — every route sets a document `title` via Angular's router

---

## Architecture

### Project Structure

```
src/app/
├── core/                  # Singleton concerns (loaded once at root)
│   ├── guards/            # Route guards
│   ├── interceptors/      # HTTP interceptors
│   ├── models/            # TypeScript interfaces / data models
│   └── services/          # Global services (auth, cart, theme, toast …)
├── features/              # Business-domain feature modules
│   ├── admin/             # Admin panel (dashboard, users, sellers, orders, categories, coupons)
│   ├── auth/              # Login, register, OTP, forgot-password pages
│   ├── cart/              # Cart, checkout, order-success
│   ├── home/              # Hero, top-categories, benefits, explore-categories
│   ├── products/          # Product list, product details
│   ├── profile/           # User profile & addresses
│   ├── seller/            # Seller portal (dashboard, products, orders, profile)
│   ├── wishlist/          # Wishlist page
│   ├── order-history/     # Order history page
│   ├── categories/        # Categories browse page
│   └── …                  # about, contact-us, faqs, privacy-policy, shipping-returns
└── shared/                # Reusable, stateless UI pieces
    ├── components/        # navbar, footer, product-card, chatbot, toast, spinner, payment-modal …
    ├── directives/
    └── pipes/
```

### Routing & Lazy Loading

Every feature is **lazily loaded** via `loadComponent` in `app.routes.ts`. The route tree has three top-level shells:

1. `/seller` — `SellerLayout` (requires `sellerMatchGuard` + `sellerGuard`)
2. `/admin` — `AdminLayout` (requires `adminGuard`)
3. `/` — `PublicLayout` (navbar + footer; open to all)

### State Management

Angular **Signals** are used throughout:

- `AuthState` service holds the JWT in a `signal<string|null>`, with `computed` derivations for `user`, `isLoggedIn`, and `role`
- `CartService`, `WishlistService`, etc. expose signal-based reactive stores
- `ThemeService` reactively applies the correct theme whenever the logged-in user changes (via `effect`)

### HTTP Interceptors

Three functional interceptors are chained in `app.config.ts`:

| Interceptor          | Responsibility                                                                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `authInterceptor`    | Attaches `Authorization: Bearer <token>` to every outgoing request (skips `/refresh`)                                                                                          |
| `refreshInterceptor` | Catches `401` responses, silently fetches a new access token, queues concurrent requests, then replays them — clears auth and redirects to `/auth/login` if refresh also fails |
| `errorInterceptor`   | Extracts the backend error message and fires a toast; suppresses toasts for guest 401s and for unverified-account errors (handled locally in the component)                    |

### Route Guards

| Guard               | Protects                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| `authGuard`         | Any route that requires a logged-in user                                                             |
| `guestGuard`        | Login/register pages — redirects authenticated users away                                            |
| `adminGuard`        | All `/admin/*` routes                                                                                |
| `sellerGuard`       | All `/seller/*` routes (approved sellers only)                                                       |
| `sellerMatchGuard`  | `canMatch` used to exclude `/seller/pending` from the seller shell so it renders in the public shell |
| `checkoutGuard`     | `/checkout` — blocks access if the cart is empty                                                     |
| `orderSuccessGuard` | `/checkout/success` — blocks direct URL access; requires arriving from a completed order             |

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- Angular CLI ≥ 21 (`npm i -g @angular/cli`)
- The Express backend running on `https://express-e-commerce-xi.vercel.app` (see `FULL_API_DOCUMENTATION.md`)

### Installation

```bash
git clone <repo-url>
cd ExpressoCart
npm install
```

### Development Server

```bash
npm start
```

---

## Scripts

| Command         | Description                                    |
| --------------- | ---------------------------------------------- |
| `npm start`     | Start the dev server (`ng serve`) on port 4200 |
| `npm run build` | Production build into `dist/`                  |
| `npm run watch` | Watch build in development configuration       |
| `npm test`      | Run unit tests with Karma                      |

---

## Environment Configuration

Environment files live in `src/app/environments/`:

| File                         | Used when                |
| ---------------------------- | ------------------------ |
| `environment.development.ts` | `ng serve` (development) |
| `environment.production.ts`  | `ng build` (production)  |

Set your `apiUrl` and any third-party keys (Stripe publishable key, Google client ID) in the appropriate environment file.

---

## Deployment

The project ships with a `vercel.json` that rewrites all paths to `index.html` so Angular's client-side router works correctly on Vercel. Run `npm run build` and point Vercel to the `dist/expresso-cart/browser` output directory.
