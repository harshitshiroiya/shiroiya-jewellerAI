import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-stone-50">
      <div class="bg-white border-b border-stone-100">
        <div class="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <h1 class="text-3xl font-bold text-stone-900 tracking-tight">My Orders</h1>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        @if (orders().length === 0) {
          <div class="text-center py-20 bg-white border border-stone-100 rounded-lg">
            <h2 class="text-lg font-semibold text-stone-700">No orders yet</h2>
            <p class="text-sm text-stone-400 mt-1">Your order history will appear here.</p>
            <a routerLink="/catalog"
              class="inline-block mt-5 px-5 py-2.5 bg-stone-900 text-white text-sm font-semibold rounded hover:bg-stone-800 transition-colors">
              Browse Collection
            </a>
          </div>
        } @else {
          <div class="space-y-3">
            @for (order of orders(); track order.id) {
              <a [routerLink]="['/orders', order.id]"
                class="block bg-white border border-stone-100 rounded-lg p-5 hover:border-stone-200 hover:shadow-sm transition-all duration-200">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="text-sm font-bold text-stone-900">{{ order.orderNumber }}</p>
                    <p class="text-xs text-stone-400 mt-0.5">{{ order.createdAt | date:'mediumDate' }} &middot; {{ order.orderItems.length }} item(s)</p>
                  </div>
                  <div class="text-right flex items-center gap-4">
                    <span class="inline-block px-2.5 py-1 rounded text-[11px] font-semibold"
                      [class.bg-amber-50]="order.status === 'Confirmed'"
                      [class.text-amber-800]="order.status === 'Confirmed'"
                      [class.border-amber-200]="order.status === 'Confirmed'"
                      [class.bg-blue-50]="order.status === 'InProduction'"
                      [class.text-blue-800]="order.status === 'InProduction'"
                      [class.bg-purple-50]="order.status === 'QualityCheck'"
                      [class.text-purple-800]="order.status === 'QualityCheck'"
                      [class.bg-indigo-50]="order.status === 'Dispatched'"
                      [class.text-indigo-800]="order.status === 'Dispatched'"
                      [class.bg-green-50]="order.status === 'Delivered'"
                      [class.text-green-800]="order.status === 'Delivered'"
                      [class.bg-red-50]="order.status === 'Cancelled'"
                      [class.text-red-800]="order.status === 'Cancelled'"
                      class="border">
                      {{ order.status }}
                    </span>
                    <span class="text-sm font-bold text-stone-900">&#8377;{{ order.totalAmount | number }}</span>
                  </div>
                </div>
              </a>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class OrderListComponent implements OnInit {
  orders = signal<Order[]>([]);

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.orderService.getOrders().subscribe(orders => this.orders.set(orders));
  }
}
