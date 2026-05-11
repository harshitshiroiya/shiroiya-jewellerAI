import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-6 py-8">
        <h1 class="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <p class="text-sm text-gray-500">Total Orders</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">--</p>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <p class="text-sm text-gray-500">Revenue (This Month)</p>
            <p class="text-3xl font-bold text-amber-600 mt-2">--</p>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <p class="text-sm text-gray-500">Products in Inventory</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">--</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a routerLink="/admin/products" class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <h3 class="text-lg font-bold">Manage Inventory</h3>
            <p class="text-gray-500 mt-1">Add, edit, and manage product catalog</p>
          </a>
          <a routerLink="/admin/orders" class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <h3 class="text-lg font-bold">Manage Orders</h3>
            <p class="text-gray-500 mt-1">View orders, update status, approve designs</p>
          </a>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {}
