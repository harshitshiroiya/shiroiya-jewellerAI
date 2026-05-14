import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, AdminStats } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-champagne-50">
      <div class="bg-white border-b border-champagne-100">
        <div class="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <p class="text-champagne-500 text-[11px] font-semibold tracking-[0.3em] uppercase mb-2">Administration</p>
          <h1 class="font-serif text-4xl font-light text-champagne-900 italic">Dashboard</h1>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          <div class="bg-white border border-champagne-100 rounded-xl p-5">
            <p class="text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Orders</p>
            <p class="text-2xl font-semibold text-champagne-900 mt-1">{{ stats()?.totalOrders ?? '—' }}</p>
          </div>
          <div class="bg-white border border-champagne-100 rounded-xl p-5">
            <p class="text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Revenue</p>
            <p class="text-2xl font-semibold text-champagne-900 mt-1">&#8377;{{ stats()?.totalRevenue | number:'1.0-0' }}</p>
          </div>
          <div class="bg-white border border-champagne-100 rounded-xl p-5">
            <p class="text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Pending</p>
            <p class="text-2xl font-semibold text-amber-700 mt-1">{{ stats()?.pendingOrders ?? '—' }}</p>
          </div>
          <div class="bg-white border border-champagne-100 rounded-xl p-5">
            <p class="text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">In Production</p>
            <p class="text-2xl font-semibold text-blue-700 mt-1">{{ stats()?.inProduction ?? '—' }}</p>
          </div>
          <div class="bg-white border border-champagne-100 rounded-xl p-5">
            <p class="text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Products</p>
            <p class="text-2xl font-semibold text-champagne-900 mt-1">{{ stats()?.totalProducts ?? '—' }}</p>
          </div>
          <div class="bg-white border border-champagne-100 rounded-xl p-5">
            <p class="text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Customers</p>
            <p class="text-2xl font-semibold text-champagne-900 mt-1">{{ stats()?.totalCustomers ?? '—' }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <a routerLink="/admin/products"
            class="bg-white border border-champagne-100 rounded-xl p-6 hover:border-champagne-300 hover:shadow-lg hover:shadow-champagne-200/20 transition-all duration-300 group">
            <h3 class="font-serif text-lg text-champagne-900 group-hover:text-champagne-700 transition-colors">Inventory</h3>
            <p class="text-xs text-champagne-500 mt-1">Add, edit, and manage product catalog</p>
          </a>
          <a routerLink="/admin/orders"
            class="bg-white border border-champagne-100 rounded-xl p-6 hover:border-champagne-300 hover:shadow-lg hover:shadow-champagne-200/20 transition-all duration-300 group">
            <h3 class="font-serif text-lg text-champagne-900 group-hover:text-champagne-700 transition-colors">Orders</h3>
            <p class="text-xs text-champagne-500 mt-1">View orders, update status, generate documents</p>
          </a>
          <a routerLink="/admin/promotions"
            class="bg-white border border-champagne-100 rounded-xl p-6 hover:border-champagne-300 hover:shadow-lg hover:shadow-champagne-200/20 transition-all duration-300 group">
            <h3 class="font-serif text-lg text-champagne-900 group-hover:text-champagne-700 transition-colors">Promotions</h3>
            <p class="text-xs text-champagne-500 mt-1">Manage coupon codes and discounts</p>
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
