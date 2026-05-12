import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-stone-50">
      <div class="bg-white border-b border-stone-100">
        <div class="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <h1 class="text-3xl font-bold text-stone-900 tracking-tight">Your Cart</h1>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        @if (cartService.items().length === 0) {
          <div class="text-center py-20 bg-white border border-stone-100 rounded-lg">
            <svg class="w-12 h-12 mx-auto text-stone-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            <h2 class="text-lg font-semibold text-stone-700">Your cart is empty</h2>
            <p class="text-sm text-stone-400 mt-1">Browse our collection to find something you love.</p>
            <a routerLink="/catalog"
              class="inline-block mt-6 px-6 py-2.5 bg-stone-900 text-white text-sm font-semibold rounded hover:bg-stone-800 transition-colors">
              Browse Collection
            </a>
          </div>
        } @else {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-3">
              @for (item of cartService.items(); track item.id) {
                <div class="bg-white border border-stone-100 rounded-lg p-4 flex gap-4 items-center hover:border-stone-200 transition-colors">
                  <div class="w-16 h-16 bg-stone-100 rounded flex items-center justify-center shrink-0">
                    @if (item.product?.imageUrls?.length) {
                      <img [src]="item.product!.imageUrls[0]" class="w-full h-full object-cover rounded" />
                    } @else {
                      <span class="text-xl opacity-40">&#10022;</span>
                    }
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-semibold text-stone-900 truncate">{{ item.product?.name || 'Custom Design' }}</h3>
                    <p class="text-sm font-bold text-stone-700 mt-0.5">&#8377;{{ item.unitPrice | number }}</p>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <button (click)="updateQty(item.id, item.quantity - 1)"
                      class="w-7 h-7 border border-stone-200 rounded text-stone-600 flex items-center justify-center text-sm hover:bg-stone-50 transition-colors">
                      &minus;
                    </button>
                    <span class="w-7 text-center text-sm font-medium text-stone-800">{{ item.quantity }}</span>
                    <button (click)="updateQty(item.id, item.quantity + 1)"
                      class="w-7 h-7 border border-stone-200 rounded text-stone-600 flex items-center justify-center text-sm hover:bg-stone-50 transition-colors">
                      +
                    </button>
                  </div>
                  <button (click)="remove(item.id)" class="text-xs text-stone-400 hover:text-red-600 transition-colors ml-2">Remove</button>
                </div>
              }
            </div>

            <div class="lg:sticky lg:top-24 h-fit">
              <div class="bg-white border border-stone-100 rounded-lg p-6">
                <h3 class="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-4">Order Summary</h3>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between text-stone-600">
                    <span>Items ({{ cartService.itemCount() }})</span>
                    <span>&#8377;{{ cartService.totalPrice() | number }}</span>
                  </div>
                  <div class="flex justify-between text-stone-600">
                    <span>Shipping</span>
                    <span class="text-green-700 font-medium">Free</span>
                  </div>
                  <div class="border-t border-stone-100 pt-3 flex justify-between font-bold text-stone-900">
                    <span>Total</span>
                    <span>&#8377;{{ cartService.totalPrice() | number }}</span>
                  </div>
                </div>
                <a routerLink="/checkout"
                  class="block mt-5 text-center py-2.5 bg-stone-900 text-white rounded text-sm font-semibold hover:bg-stone-800 transition-colors">
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
