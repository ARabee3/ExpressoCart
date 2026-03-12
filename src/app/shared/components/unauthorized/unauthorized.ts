import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  imports: [RouterLink],
  template: `
    <div
      class="min-h-screen bg-brand-surface flex flex-col items-center justify-center px-4 text-center relative overflow-hidden"
    >
      <!-- Background pattern -->
      <div
        class="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-brand-primary/5 via-brand-surface to-brand-surface opacity-70"
      ></div>

      <div class="relative z-10 max-w-md w-full">
        <!-- Animated Icon Container -->
        <div class="relative mx-auto w-28 h-28 mb-8">
          <div class="absolute inset-0 bg-red-500/20 rounded-full animate-ping" style="animation-duration: 3s;"></div>
          <div class="absolute inset-2 bg-red-500/20 rounded-full animate-pulse"></div>
          <div
            class="absolute inset-4 bg-brand-surface border border-red-100 shadow-xl rounded-full flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-10 h-10 text-red-500"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
        </div>

        <!-- Typography -->
        <div class="space-y-4 mb-10">
          <p class="text-xs font-bold text-red-500 uppercase tracking-widest">Error 403</p>
          <h1 class="text-4xl md:text-5xl font-black text-brand-primary tracking-tight">
            Access Denied
          </h1>
          <p class="text-brand-primary/50 text-base max-w-sm mx-auto leading-relaxed">
            You don't have permission to view this page. This area is restricted to authorized users
            only.
          </p>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <a
            routerLink="/"
            class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-primary text-brand-surface text-sm font-bold shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            Go Home
          </a>
          <a
            routerLink="/auth/login"
            class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-surface border-2 border-brand-primary/10 text-brand-primary text-sm font-bold hover:border-brand-primary hover:bg-brand-primary/5 transition-all duration-200"
          >
            Switch Account
          </a>
        </div>
      </div>
    </div>
  `,
})
export class Unauthorized {}
