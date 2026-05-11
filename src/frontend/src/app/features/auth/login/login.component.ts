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
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-rose-50">
      <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Shiroiya JewellerAI</h1>
          <p class="text-gray-500 mt-2">Sign in to your account</p>
        </div>

        @if (error()) {
          <div class="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{{ error() }}</div>
        }

        <form (ngSubmit)="onLogin()" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" [(ngModel)]="email" name="email" required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="you@example.com" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" [(ngModel)]="password" name="password" required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="••••••••" />
          </div>

          <button type="submit" [disabled]="loading()"
            class="w-full py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition disabled:opacity-50">
            {{ loading() ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p class="text-center mt-6 text-sm text-gray-600">
          Don't have an account? <a routerLink="/auth/register" class="text-amber-600 font-semibold hover:underline">Sign Up</a>
        </p>
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
