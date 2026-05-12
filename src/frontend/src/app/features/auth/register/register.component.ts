import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex">
      <div class="hidden lg:flex lg:w-1/2 bg-stone-900 items-center justify-center p-16">
        <div class="max-w-md">
          <p class="text-amber-500/80 text-xs font-semibold tracking-[0.2em] uppercase mb-6">Join Us</p>
          <h2 class="text-4xl font-bold text-white leading-tight tracking-tight">
            Begin your personal jewellery story.
          </h2>
          <p class="text-stone-400 mt-4 leading-relaxed">
            Create an account to save designs, get AI-curated recommendations, and track your orders.
          </p>
        </div>
      </div>

      <div class="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div class="w-full max-w-sm">
          <div class="mb-8">
            <a routerLink="/" class="text-lg font-semibold text-stone-900 tracking-tight">
              <span class="text-amber-700">S</span>hiroiya
            </a>
            <h1 class="text-2xl font-bold text-stone-900 mt-6">Create account</h1>
            <p class="text-stone-500 text-sm mt-1">Fill in your details to get started</p>
          </div>

          @if (error()) {
            <div class="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded text-sm mb-5">{{ error() }}</div>
          }

          <form (ngSubmit)="onRegister()" class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">First Name</label>
                <input type="text" [(ngModel)]="firstName" name="firstName" required autocomplete="given-name"
                  class="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">Last Name</label>
                <input type="text" [(ngModel)]="lastName" name="lastName" required autocomplete="family-name"
                  class="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">Email</label>
              <input type="email" [(ngModel)]="email" name="email" required autocomplete="email"
                class="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition"
                placeholder="you@example.com" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">Password</label>
              <input type="password" [(ngModel)]="password" name="password" required minlength="8" autocomplete="new-password"
                class="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition"
                placeholder="Min 8 characters" />
            </div>

            <button type="submit" [disabled]="loading()"
              class="w-full py-2.5 bg-stone-900 text-white rounded text-sm font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {{ loading() ? 'Creating account...' : 'Create account' }}
            </button>
          </form>

          <p class="text-center mt-6 text-sm text-stone-500">
            Already have an account? <a routerLink="/auth/login" class="font-semibold text-amber-700 hover:text-amber-800">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    this.loading.set(true);
    this.error.set('');
    this.authService.register({
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Registration failed. Please try again.');
      }
    });
  }
}
