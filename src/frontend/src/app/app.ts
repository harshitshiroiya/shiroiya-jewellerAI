import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <nav class="bg-white border-b sticky top-0 z-50">
      <div class="container mx-auto px-6 py-3 flex items-center justify-between">
        <a routerLink="/" class="text-xl font-bold text-gray-900">
          <span class="text-amber-600">Shiroiya</span> JewellerAI
        </a>

        <div class="hidden md:flex items-center gap-6 text-sm font-medium">
          <a routerLink="/catalog" class="text-gray-700 hover:text-amber-600 transition">Catalog</a>
          <a routerLink="/ai-assistant" class="text-gray-700 hover:text-amber-600 transition">AI Assistant</a>
          <a routerLink="/custom-design" class="text-gray-700 hover:text-amber-600 transition">Custom Design</a>
        </div>

        <div class="flex items-center gap-4">
          @if (authService.isAuthenticated()) {
            <a routerLink="/cart" class="relative text-gray-700 hover:text-amber-600">
              🛒
              @if (cartService.itemCount() > 0) {
                <span class="absolute -top-2 -right-2 w-5 h-5 bg-amber-600 text-white rounded-full text-xs flex items-center justify-center">
                  {{ cartService.itemCount() }}
                </span>
              }
            </a>
            <a routerLink="/orders" class="text-sm text-gray-700 hover:text-amber-600">Orders</a>
            @if (authService.isAdmin()) {
              <a routerLink="/admin" class="text-sm text-gray-700 hover:text-amber-600">Admin</a>
            }
            <button (click)="authService.logout()" class="text-sm text-gray-500 hover:text-red-500">Logout</button>
          } @else {
            <a routerLink="/auth/login" class="text-sm text-gray-700 hover:text-amber-600">Login</a>
            <a routerLink="/auth/register" class="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700">Sign Up</a>
          }
        </div>
      </div>
    </nav>

    <router-outlet />

    <footer class="bg-gray-900 text-gray-400 py-12">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-white font-bold text-lg mb-3">Shiroiya JewellerAI</h3>
            <p class="text-sm">AI-powered jewellery e-commerce with custom 3D design studio.</p>
          </div>
          <div>
            <h4 class="text-white font-medium mb-3">Quick Links</h4>
            <div class="space-y-2 text-sm">
              <a routerLink="/catalog" class="block hover:text-white">Catalog</a>
              <a routerLink="/ai-assistant" class="block hover:text-white">AI Assistant</a>
              <a routerLink="/custom-design" class="block hover:text-white">Custom Design</a>
            </div>
          </div>
          <div>
            <h4 class="text-white font-medium mb-3">Contact</h4>
            <p class="text-sm">support&#64;shiroiya-jeweller.ai</p>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`:host { display: flex; flex-direction: column; min-height: 100vh; } router-outlet + * { flex: 1; }`]
})
export class App {
  constructor(public authService: AuthService, public cartService: CartService) {}
}
