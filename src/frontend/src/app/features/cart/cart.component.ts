import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-champagne-50">
      <div class="bg-white border-b border-champagne-100">
        <div class="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <h1 class="font-serif text-4xl font-light text-champagne-900 italic">Your Cart</h1>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        @if (cartService.items().length === 0) {
          <div class="text-center py-24 bg-white border border-champagne-100 rounded-2xl">
            <svg class="w-14 h-14 mx-auto text-champagne-300 mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            <h2 class="font-serif text-xl text-champagne-800 italic">Your cart is empty</h2>
            <p class="text-sm text-champagne-500 mt-2">Discover something extraordinary from our collection.</p>
            <a routerLink="/catalog"
              class="inline-block mt-7 px-7 py-3 bg-champagne-900 text-champagne-50 text-sm font-medium rounded-full hover:bg-champagne-800 transition-colors">
              Browse Collection
            </a>
          </div>
        } @else {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-3">
              @for (item of cartService.items(); track item.id) {
                <div class="bg-white border border-champagne-100 rounded-xl p-5 flex gap-5 items-center hover:border-champagne-200 transition-colors">
                  <div class="w-18 h-18 bg-champagne-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                    @if (item.product?.imageUrls?.length) {
                      <img [src]="item.product!.imageUrls[0]" class="w-full h-full object-cover" />
                    } @else {
                      <span class="font-serif text-lg text-champagne-400 italic">S</span>
                    }
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-medium text-champagne-900 truncate">{{ item.product?.name || 'Custom Design' }}</h3>
                    <p class="text-sm font-semibold text-champagne-700 mt-1">&#8377;{{ item.unitPrice | number }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button (click)="updateQty(item.id, item.quantity - 1)"
                      class="w-8 h-8 border border-champagne-200 rounded-full text-champagne-600 flex items-center justify-center text-sm hover:bg-champagne-50 transition-colors">
                      &minus;
                    </button>
                    <span class="w-6 text-center text-sm font-medium text-champagne-800">{{ item.quantity }}</span>
                    <button (click)="updateQty(item.id, item.quantity + 1)"
                      class="w-8 h-8 border border-champagne-200 rounded-full text-champagne-600 flex items-center justify-center text-sm hover:bg-champagne-50 transition-colors">
                      +
                    </button>
                  </div>
                  <button (click)="remove(item.id)" class="text-xs text-champagne-400 hover:text-red-600 transition-colors ml-2">Remove</button>
                </div>
              }
            </div>

            <div class="lg:sticky lg:top-24 h-fit">
              <div class="bg-white border border-champagne-100 rounded-xl p-6">
                <h3 class="text-[11px] font-semibold text-champagne-700 uppercase tracking-[0.15em] mb-5">Order Summary</h3>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between text-champagne-600">
                    <span>Items ({{ cartService.itemCount() }})</span>
                    <span>&#8377;{{ cartService.totalPrice() | number }}</span>
                  </div>
                  <div class="flex justify-between text-champagne-600">
                    <span>Shipping</span>
                    <span class="text-green-700 font-medium">Free</span>
                  </div>
                  <div class="border-t border-champagne-100 pt-3 flex justify-between font-semibold text-champagne-900 text-base">
                    <span>Total</span>
                    <span>&#8377;{{ cartService.totalPrice() | number }}</span>
                  </div>
                </div>
                <a routerLink="/checkout"
                  class="block mt-6 text-center py-3.5 bg-champagne-900 text-champagne-50 rounded-full text-sm font-medium hover:bg-champagne-800 transition-colors">
                  Proceed to Checkout
                </a>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class CartComponent implements OnInit {
  constructor(public cartService: CartService) {}

  ngOnInit() {
    this.cartService.loadCart().subscribe();
  }

  updateQty(itemId: string, qty: number) {
    if (qty < 1) return;
    this.cartService.updateQuantity(itemId, qty).subscribe();
  }

  remove(itemId: string) {
    this.cartService.removeItem(itemId).subscribe();
  }
}
