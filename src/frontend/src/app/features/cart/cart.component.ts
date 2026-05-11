import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-6 py-8">
        <h1 class="text-3xl font-bold mb-8">Shopping Cart</h1>

        @if (cartService.items().length === 0) {
          <div class="text-center py-16 bg-white rounded-2xl">
            <div class="text-6xl mb-4">🛒</div>
            <h2 class="text-xl font-semibold text-gray-700">Your cart is empty</h2>
            <p class="text-gray-500 mt-2">Browse our collection to find something you love.</p>
            <a routerLink="/catalog" class="inline-block mt-6 px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700">
              Browse Catalog
            </a>
          </div>
        } @else {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-4">
              @for (item of cartService.items(); track item.id) {
                <div class="bg-white rounded-xl p-4 flex gap-4 items-center shadow-sm">
                  <div class="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    @if (item.product?.imageUrls?.length) {
                      <img [src]="item.product!.imageUrls[0]" class="w-full h-full object-cover rounded-lg" />
                    } @else {
                      <span class="text-2xl">💎</span>
                    }
                  </div>
                  <div class="flex-1">
                    <h3 class="font-semibold">{{ item.product?.name || 'Custom Design' }}</h3>
                    <p class="text-amber-600 font-bold">₹{{ item.unitPrice | number }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button (click)="updateQty(item.id, item.quantity - 1)" class="w-8 h-8 border rounded flex items-center justify-center">-</button>
                    <span class="w-8 text-center">{{ item.quantity }}</span>
                    <button (click)="updateQty(item.id, item.quantity + 1)" class="w-8 h-8 border rounded flex items-center justify-center">+</button>
                  </div>
                  <button (click)="remove(item.id)" class="text-red-500 hover:text-red-700 text-sm">Remove</button>
                </div>
              }
            </div>

            <div class="bg-white rounded-xl p-6 shadow-sm h-fit">
              <h3 class="text-lg font-bold mb-4">Order Summary</h3>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between"><span>Items ({{ cartService.itemCount() }})</span><span>₹{{ cartService.totalPrice() | number }}</span></div>
                <div class="flex justify-between"><span>Shipping</span><span class="text-green-600">Free</span></div>
                <hr />
                <div class="flex justify-between font-bold text-lg"><span>Total</span><span class="text-amber-600">₹{{ cartService.totalPrice() | number }}</span></div>
              </div>
              <a routerLink="/checkout" class="block mt-6 text-center py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition">
                Proceed to Checkout
              </a>
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
