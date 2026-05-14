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
    <nav class="fixed top-0 left-0 right-0 z-50 bg-champagne-50/90 backdrop-blur-md border-b border-champagne-200/50">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="flex items-center justify-between h-[72px]">
          <a routerLink="/" class="flex items-center gap-2">
            <span class="font-serif text-2xl font-semibold text-champagne-900 italic tracking-tight">Shiroiya</span>
          </a>

          <div class="hidden md:flex items-center gap-10">
            <a routerLink="/catalog" routerLinkActive="text-champagne-700 border-b border-champagne-600"
              class="text-[13px] font-medium text-champagne-800/70 hover:text-champagne-900 tracking-widest uppercase pb-1 transition-all duration-300">Collection</a>
            <a routerLink="/ai-assistant" routerLinkActive="text-champagne-700 border-b border-champagne-600"
              class="text-[13px] font-medium text-champagne-800/70 hover:text-champagne-900 tracking-widest uppercase pb-1 transition-all duration-300">AI Stylist</a>
            <a routerLink="/custom-design" routerLinkActive="text-champagne-700 border-b border-champagne-600"
              class="text-[13px] font-medium text-champagne-800/70 hover:text-champagne-900 tracking-widest uppercase pb-1 transition-all duration-300">Atelier</a>
          </div>

          <div class="flex items-center gap-5">
            @if (authService.isAuthenticated()) {
              <a routerLink="/cart" class="relative group">
                <svg class="w-5 h-5 text-champagne-700 group-hover:text-champagne-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
                @if (cartService.itemCount() > 0) {
                  <span class="absolute -top-1.5 -right-2 w-4 h-4 bg-champagne-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {{ cartService.itemCount() }}
                  </span>
                }
              </a>
              <a routerLink="/orders" class="text-[13px] text-champagne-700 hover:text-champagne-900 transition-colors">Orders</a>
              @if (authService.isAdmin()) {
                <a routerLink="/admin" class="text-[13px] text-champagne-700 hover:text-champagne-900 transition-colors">Admin</a>
              }
              <button (click)="authService.logout()"
                class="text-[13px] text-champagne-400 hover:text-red-700 transition-colors">Logout</button>
            } @else {
              <a routerLink="/auth/login" class="text-[13px] font-medium text-champagne-800 hover:text-champagne-900 transition-colors">Sign In</a>
              <a routerLink="/auth/register"
                class="text-[13px] font-medium px-5 py-2.5 bg-champagne-900 text-champagne-50 rounded-full hover:bg-champagne-800 transition-colors">
                Join
              </a>
            }
          </div>
        </div>
      </div>
    </nav>

    <main class="pt-[72px]">
      <router-outlet />
    </main>

    <footer class="bg-champagne-900 text-champagne-300 pt-16 pb-8">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-champagne-800/50">
          <div class="md:col-span-2">
            <h3 class="font-serif text-2xl font-semibold text-champagne-100 italic">Shiroiya</h3>
            <p class="text-sm leading-relaxed max-w-sm mt-3 text-champagne-400">Where timeless craftsmanship meets intelligent design. Each creation is a dialogue between heritage artistry and modern innovation.</p>
          </div>
          <div>
            <h4 class="text-[11px] font-semibold text-champagne-200 uppercase tracking-[0.2em] mb-4">Discover</h4>
            <div class="space-y-2.5 text-sm text-champagne-400">
              <a routerLink="/catalog" class="block hover:text-champagne-100 transition-colors">Collection</a>
              <a routerLink="/ai-assistant" class="block hover:text-champagne-100 transition-colors">AI Stylist</a>
              <a routerLink="/custom-design" class="block hover:text-champagne-100 transition-colors">Bespoke Atelier</a>
            </div>
          </div>
          <div>
            <h4 class="text-[11px] font-semibold text-champagne-200 uppercase tracking-[0.2em] mb-4">Concierge</h4>
            <div class="space-y-2.5 text-sm text-champagne-400">
              <p>concierge&#64;shiroiya.ai</p>
              <p>Mon&ndash;Sat, 10am&ndash;7pm IST</p>
            </div>
          </div>
        </div>
        <div class="pt-8 text-xs text-champagne-500 flex justify-between items-center">
          <span>&copy; 2026 Shiroiya. All rights reserved.</span>
          <span class="italic">Crafted in India</span>
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
