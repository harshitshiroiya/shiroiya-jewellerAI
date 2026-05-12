import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, AdminStats } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-stone-50">
      <div class="bg-white border-b border-stone-100">
        <div class="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <p class="text-amber-700 text-xs font-semibold tracking-[0.2em] uppercase mb-2">Administration</p>
          <h1 class="text-3xl font-bold text-stone-900 tracking-tight">Dashboard</h1>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <div class="bg-white border border-stone-100 rounded-lg p-4">
            <p class="text-[11px] font-semibold text-stone-400 uppercase tracking-wide">Orders</p>
            <p class="text-2xl font-bold text-stone-900 mt-1">{{ stats()?.totalOrders ?? '—' }}</p>
          </div>
          <div class="bg-white border border-stone-100 rounded-lg p-4">
            <p class="text-[11px] font-semibold text-stone-400 uppercase tracking-wide">Revenue</p>
            <p class="text-2xl font-bold text-stone-900 mt-1">&#8377;{{ stats()?.totalRevenue | number:'1.0-0' }}</p>
          </div>
          <div class="bg-white border border-stone-100 rounded-lg p-4">
            <p class="text-[11px] font-semibold text-stone-400 uppercase tracking-wide">Pending</p>
            <p class="text-2xl font-bold text-amber-700 mt-1">{{ stats()?.pendingOrders ?? '—' }}</p>
          </div>
          <div class="bg-white border border-stone-100 rounded-lg p-4">
            <p class="text-[11px] font-semibold text-stone-400 uppercase tracking-wide">In Production</p>
            <p class="text-2xl font-bold text-blue-700 mt-1">{{ stats()?.inProduction ?? '—' }}</p>
          </div>
          <div class="bg-white border border-stone-100 rounded-lg p-4">
            <p class="text-[11px] font-semibold text-stone-400 uppercase tracking-wide">Products</p>
            <p class="text-2xl font-bold text-stone-900 mt-1">{{ stats()?.totalProducts ?? '—' }}</p>
          </div>
          <div class="bg-white border border-stone-100 rounded-lg p-4">
            <p class="text-[11px] font-semibold text-stone-400 uppercase tracking-wide">Customers</p>
            <p class="text-2xl font-bold text-stone-900 mt-1">{{ stats()?.totalCustomers ?? '—' }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a routerLink="/admin/products"
            class="bg-white border border-stone-100 rounded-lg p-5 hover:border-stone-200 hover:shadow-sm transition-all duration-200 group">
            <h3 class="text-sm font-bold text-stone-900 group-hover:text-amber-800 transition-colors">Inventory</h3>
            <p class="text-xs text-stone-400 mt-1">Add, edit, and manage product catalog</p>
          </a>
          <a routerLink="/admin/orders"
            class="bg-white border border-stone-100 rounded-lg p-5 hover:border-stone-200 hover:shadow-sm transition-all duration-200 group">
            <h3 class="text-sm font-bold text-stone-900 group-hover:text-amber-800 transition-colors">Orders</h3>
            <p class="text-xs text-stone-400 mt-1">View orders, update status, generate documents</p>
          </a>
          <a routerLink="/admin/promotions"
            class="bg-white border border-stone-100 rounded-lg p-5 hover:border-stone-200 hover:shadow-sm transition-all duration-200 group">
            <h3 class="text-sm font-bold text-stone-900 group-hover:text-amber-800 transition-colors">Promotions</h3>
            <p class="text-xs text-stone-400 mt-1">Manage coupon codes and discounts</p>
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
