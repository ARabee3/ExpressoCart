import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div class="max-w-md w-full">
        <!-- Icon -->
        <div
          class="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-12 h-12 text-red-500"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
        </div>

        <!-- Code -->
        <p class="text-8xl font-black tracking-tighter text-gray-900 mb-2">403</p>

        <!-- Heading -->
        <h1 class="text-2xl font-bold text-gray-800 mb-3">Access Denied</h1>

        <!-- Description -->
        <p class="text-gray-500 text-sm leading-relaxed mb-8">
          You don't have permission to view this page. This area is restricted to authorized users
          only.
        </p>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            routerLink="/"
            class="px-6 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            Go Home
          </a>
          <a
            routerLink="/auth/login"
            class="px-6 py-3 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Sign In with Different Account
          </a>
        </div>
      </div>
    </div>
  `,
})
export class Unauthorized {}
