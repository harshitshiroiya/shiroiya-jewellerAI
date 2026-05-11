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
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-6 py-8">
        <h1 class="text-3xl font-bold mb-8">My Orders</h1>

        @if (orders().length === 0) {
          <div class="text-center py-16 bg-white rounded-2xl">
            <h2 class="text-xl font-semibold text-gray-700">No orders yet</h2>
            <a routerLink="/catalog" class="inline-block mt-4 px-6 py-3 bg-amber-600 text-white rounded-lg">Start Shopping</a>
          </div>
        } @else {
          <div class="space-y-4">
            @for (order of orders(); track order.id) {
              <a [routerLink]="['/orders', order.id]" class="block bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="font-bold text-lg">{{ order.orderNumber }}</p>
                    <p class="text-sm text-gray-500">{{ order.createdAt | date:'mediumDate' }}</p>
                    <p class="text-xs text-gray-400 mt-1">{{ order.orderItems.length }} item(s)</p>
                  </div>
                  <div class="text-right">
                    <span class="inline-block px-3 py-1 rounded-full text-xs font-medium"
                      [class.bg-yellow-100]="order.status === 'Confirmed'"
                      [class.text-yellow-700]="order.status === 'Confirmed'"
                      [class.bg-blue-100]="order.status === 'InProduction'"
                      [class.text-blue-700]="order.status === 'InProduction'"
                      [class.bg-purple-100]="order.status === 'QualityCheck'"
                      [class.text-purple-700]="order.status === 'QualityCheck'"
                      [class.bg-indigo-100]="order.status === 'Dispatched'"
                      [class.text-indigo-700]="order.status === 'Dispatched'"
                      [class.bg-green-100]="order.status === 'Delivered'"
                      [class.text-green-700]="order.status === 'Delivered'"
                      [class.bg-red-100]="order.status === 'Cancelled'"
                      [class.text-red-700]="order.status === 'Cancelled'">
                      {{ order.status }}
                    </span>
                    <p class="text-lg font-bold text-amber-600 mt-1">₹{{ order.totalAmount | number }}</p>
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
