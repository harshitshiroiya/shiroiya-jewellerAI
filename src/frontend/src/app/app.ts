import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200/60">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <a routerLink="/" class="flex items-center gap-2">
            <span class="text-xl tracking-tight font-semibold text-stone-900">
              <span class="text-amber-700">S</span>hiroiya
            </span>
          </a>

          <div class="hidden md:flex items-center gap-8">
            <a routerLink="/catalog" routerLinkActive="text-amber-700"
              class="text-sm font-medium text-stone-600 hover:text-stone-900 tracking-wide uppercase transition-colors duration-200">Collection</a>
            <a routerLink="/ai-assistant" routerLinkActive="text-amber-700"
              class="text-sm font-medium text-stone-600 hover:text-stone-900 tracking-wide uppercase transition-colors duration-200">AI Stylist</a>
            <a routerLink="/custom-design" routerLinkActive="text-amber-700"
              class="text-sm font-medium text-stone-600 hover:text-stone-900 tracking-wide uppercase transition-colors duration-200">Bespoke</a>
          </div>

          <div class="flex items-center gap-5">
            @if (authService.isAuthenticated()) {
              <a routerLink="/cart" class="relative group">
                <svg class="w-5 h-5 text-stone-600 group-hover:text-stone-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
                @if (cartService.itemCount() > 0) {
                  <span class="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-700 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {{ cartService.itemCount() }}
                  </span>
                }
              </a>
              <a routerLink="/orders" class="text-sm text-stone-600 hover:text-stone-900 transition-colors">Orders</a>
              @if (authService.isAdmin()) {
                <a routerLink="/admin" class="text-sm text-stone-600 hover:text-stone-900 transition-colors">Admin</a>
              }
              <button (click)="authService.logout()"
                class="text-sm text-stone-400 hover:text-red-600 transition-colors">Sign out</button>
            } @else {
              <a routerLink="/auth/login" class="text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors">Sign in</a>
              <a routerLink="/auth/register"
                class="text-sm font-medium px-4 py-2 bg-stone-900 text-white rounded hover:bg-stone-800 transition-colors">
                Create Account
              </a>
            }
          </div>
        </div>
      </div>
    </nav>

    <main class="pt-16">
      <router-outlet />
    </main>

    <footer class="bg-stone-950 text-stone-400 pt-16 pb-8">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          <div class="md:col-span-2">
            <h3 class="text-lg font-semibold text-white tracking-tight mb-3">Shiroiya JewellerAI</h3>
            <p class="text-sm leading-relaxed max-w-sm">Crafted with intelligence. Every piece is a conversation between AI precision and human artistry.</p>
          </div>
          <div>
            <h4 class="text-xs font-semibold text-stone-300 uppercase tracking-widest mb-4">Explore</h4>
            <div class="space-y-2.5 text-sm">
              <a routerLink="/catalog" class="block hover:text-white transition-colors">Collection</a>
              <a routerLink="/ai-assistant" class="block hover:text-white transition-colors">AI Stylist</a>
              <a routerLink="/custom-design" class="block hover:text-white transition-colors">Bespoke Design</a>
            </div>
          </div>
          <div>
            <h4 class="text-xs font-semibold text-stone-300 uppercase tracking-widest mb-4">Support</h4>
            <div class="space-y-2.5 text-sm">
              <p>care&#64;shiroiya.ai</p>
              <p>Mon–Sat, 10am–7pm IST</p>
            </div>
          </div>
        </div>
        <div class="pt-8 text-xs text-stone-500 flex justify-between items-center">
          <span>&copy; 2026 Shiroiya JewellerAI. All rights reserved.</span>
          <span>Handcrafted in India</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; }
    main { flex: 1; }
  `]
})
export class App {
  constructor(public authService: AuthService, public cartService: CartService) {}
}
