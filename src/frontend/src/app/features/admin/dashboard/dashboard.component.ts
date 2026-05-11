import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, AdminStats } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-6 py-8">
        <h1 class="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <p class="text-sm text-gray-500">Total Orders</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats()?.totalOrders ?? '--' }}</p>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <p class="text-sm text-gray-500">Revenue</p>
            <p class="text-3xl font-bold text-amber-600 mt-2">₹{{ stats()?.totalRevenue | number:'1.0-0' }}</p>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <p class="text-sm text-gray-500">Pending</p>
            <p class="text-3xl font-bold text-yellow-600 mt-2">{{ stats()?.pendingOrders ?? '--' }}</p>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <p class="text-sm text-gray-500">In Production</p>
            <p class="text-3xl font-bold text-blue-600 mt-2">{{ stats()?.inProduction ?? '--' }}</p>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <p class="text-sm text-gray-500">Products</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats()?.totalProducts ?? '--' }}</p>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <p class="text-sm text-gray-500">Customers</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats()?.totalCustomers ?? '--' }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a routerLink="/admin/products" class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border-l-4 border-amber-500">
            <h3 class="text-lg font-bold">Manage Inventory</h3>
            <p class="text-gray-500 mt-1">Add, edit, and manage product catalog</p>
          </a>
          <a routerLink="/admin/orders" class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border-l-4 border-blue-500">
            <h3 class="text-lg font-bold">Manage Orders</h3>
            <p class="text-gray-500 mt-1">View orders, update status, generate documents</p>
          </a>
          <a routerLink="/admin/promotions" class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border-l-4 border-green-500">
            <h3 class="text-lg font-bold">Promotions</h3>
            <p class="text-gray-500 mt-1">Manage coupon codes and discounts</p>
          </a>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  stats = signal<AdminStats | null>(null);

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getStats().subscribe(stats => this.stats.set(stats));
  }
}
