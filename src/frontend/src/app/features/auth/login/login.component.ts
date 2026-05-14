import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex">
      <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-champagne-200 via-champagne-100 to-champagne-50 items-center justify-center p-16 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_40%,rgba(196,154,92,0.15),transparent_60%)]"></div>
        <div class="relative max-w-md">
          <p class="text-champagne-600 text-[11px] font-semibold tracking-[0.3em] uppercase mb-5">Welcome Back</p>
          <h2 class="font-serif text-4xl font-light text-champagne-900 italic leading-tight">
            Your personal collection awaits.
          </h2>
          <p class="text-champagne-700/60 mt-4 leading-relaxed">
            Access saved designs, track bespoke orders, and continue your journey of refined taste.
          </p>
        </div>
      </div>

      <div class="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div class="w-full max-w-sm">
          <div class="mb-10">
            <a routerLink="/" class="font-serif text-2xl font-semibold text-champagne-900 italic">Shiroiya</a>
            <h1 class="text-xl font-medium text-champagne-900 mt-8">Sign in to your account</h1>
            <p class="text-champagne-600/60 text-sm mt-1">Enter your credentials below</p>
          </div>

          @if (error()) {
            <div class="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg text-sm mb-5">{{ error() }}</div>
          }

          <form (ngSubmit)="onLogin()" class="space-y-5">
            <div>
              <label class="block text-[11px] font-medium text-champagne-700 uppercase tracking-[0.15em] mb-2">Email</label>
              <input type="email" [(ngModel)]="email" name="email" required autocomplete="email"
                class="w-full px-4 py-3 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm text-champagne-900 placeholder:text-champagne-400 focus:outline-none focus:ring-2 focus:ring-champagne-300 focus:border-champagne-400 transition"
                placeholder="you@example.com" />
            </div>

            <div>
              <label class="block text-[11px] font-medium text-champagne-700 uppercase tracking-[0.15em] mb-2">Password</label>
              <input type="password" [(ngModel)]="password" name="password" required autocomplete="current-password"
                class="w-full px-4 py-3 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm text-champagne-900 placeholder:text-champagne-400 focus:outline-none focus:ring-2 focus:ring-champagne-300 focus:border-champagne-400 transition"
                placeholder="Enter your password" />
            </div>

            <button type="submit" [disabled]="loading()"
              class="w-full py-3.5 bg-champagne-900 text-champagne-50 rounded-full text-sm font-medium hover:bg-champagne-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-3">
              {{ loading() ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <p class="text-center mt-8 text-sm text-champagne-600/60">
            New here? <a routerLink="/auth/register" class="font-medium text-champagne-700 hover:text-champagne-900">Create an account</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.loading.set(true);
    this.error.set('');
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Invalid email or password.');
      }
    });
  }
}
