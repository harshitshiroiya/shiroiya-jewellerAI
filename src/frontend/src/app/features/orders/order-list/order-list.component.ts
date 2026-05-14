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
    <div class="min-h-screen bg-champagne-50">
      <div class="bg-white border-b border-champagne-100">
        <div class="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <h1 class="font-serif text-4xl font-light text-champagne-900 italic">My Orders</h1>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        @if (orders().length === 0) {
          <div class="text-center py-24 bg-white border border-champagne-100 rounded-2xl">
            <h2 class="font-serif text-xl text-champagne-800 italic">No orders yet</h2>
            <p class="text-sm text-champagne-500 mt-2">Your order history will appear here.</p>
            <a routerLink="/catalog"
              class="inline-block mt-6 px-6 py-3 bg-champagne-900 text-champagne-50 text-sm font-medium rounded-full hover:bg-champagne-800 transition-colors">
              Browse Collection
            </a>
          </div>
        } @else {
          <div class="space-y-3">
            @for (order of orders(); track order.id) {
              <a [routerLink]="['/orders', order.id]"
                class="block bg-white border border-champagne-100 rounded-xl p-6 hover:border-champagne-300 hover:shadow-lg hover:shadow-champagne-200/20 transition-all duration-300">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="text-sm font-semibold text-champagne-900">{{ order.orderNumber }}</p>
                    <p class="text-xs text-champagne-500 mt-1">{{ order.createdAt | date:'mediumDate' }} &middot; {{ order.orderItems.length }} item(s)</p>
                  </div>
                  <div class="text-right flex items-center gap-4">
                    <span class="inline-block px-3 py-1 rounded-full text-[11px] font-medium border"
                      [class.bg-amber-50]="order.status === 'Confirmed'"
                      [class.text-amber-800]="order.status === 'Confirmed'"
                      [class.border-amber-200]="order.status === 'Confirmed'"
                      [class.bg-blue-50]="order.status === 'InProduction'"
                      [class.text-blue-800]="order.status === 'InProduction'"
                      [class.border-blue-200]="order.status === 'InProduction'"
                      [class.bg-purple-50]="order.status === 'QualityCheck'"
                      [class.text-purple-800]="order.status === 'QualityCheck'"
                      [class.border-purple-200]="order.status === 'QualityCheck'"
                      [class.bg-indigo-50]="order.status === 'Dispatched'"
                      [class.text-indigo-800]="order.status === 'Dispatched'"
                      [class.border-indigo-200]="order.status === 'Dispatched'"
                      [class.bg-green-50]="order.status === 'Delivered'"
                      [class.text-green-800]="order.status === 'Delivered'"
                      [class.border-green-200]="order.status === 'Delivered'"
                      [class.bg-red-50]="order.status === 'Cancelled'"
                      [class.text-red-800]="order.status === 'Cancelled'"
                      [class.border-red-200]="order.status === 'Cancelled'">
                      {{ order.status }}
                    </span>
                    <span class="text-base font-semibold text-champagne-900">&#8377;{{ order.totalAmount | number }}</span>
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
