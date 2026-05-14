import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-champagne-50">
      <div class="bg-white border-b border-champagne-100">
        <div class="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <a routerLink="/admin" class="text-champagne-500 text-xs font-medium hover:text-champagne-700 transition-colors">&larr; Dashboard</a>
          <p class="text-champagne-500 text-[11px] font-semibold tracking-[0.3em] uppercase mb-2 mt-4">Administration</p>
          <div class="flex justify-between items-end">
            <h1 class="font-serif text-4xl font-light text-champagne-900 italic">Orders</h1>
            <select [(ngModel)]="statusFilter" (ngModelChange)="loadOrders()" class="px-4 py-2.5 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 transition">
              <option value="">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="DesignApproved">Design Approved</option>
              <option value="InProduction">In Production</option>
              <option value="QualityCheck">Quality Check</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div class="bg-white rounded-2xl border border-champagne-100 overflow-hidden">
          <table class="w-full">
            <thead class="bg-champagne-50">
              <tr>
                <th class="px-5 py-3 text-left text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Order #</th>
                <th class="px-5 py-3 text-left text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Date</th>
                <th class="px-5 py-3 text-left text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Items</th>
                <th class="px-5 py-3 text-left text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Total</th>
                <th class="px-5 py-3 text-left text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Payment</th>
                <th class="px-5 py-3 text-left text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Status</th>
                <th class="px-5 py-3 text-left text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (order of orders(); track order.id) {
                <tr class="border-t border-champagne-100 hover:bg-champagne-50/50 transition-colors">
                  <td class="px-5 py-3.5 text-sm font-medium text-champagne-900">{{ order.orderNumber }}</td>
                  <td class="px-5 py-3.5 text-sm text-champagne-600">{{ order.createdAt | date:'mediumDate' }}</td>
                  <td class="px-5 py-3.5 text-sm text-champagne-700">{{ order.orderItems?.length }}</td>
                  <td class="px-5 py-3.5 text-sm font-semibold text-champagne-800">&#8377;{{ order.totalAmount | number }}</td>
                  <td class="px-5 py-3.5">
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                      [class.bg-green-50]="order.paymentStatus === 'Succeeded'"
                      [class.text-green-700]="order.paymentStatus === 'Succeeded'"
                      [class.bg-yellow-50]="order.paymentStatus === 'Pending'"
                      [class.text-yellow-700]="order.paymentStatus === 'Pending'">
                      {{ order.paymentStatus }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5">
                    <select [ngModel]="order.status" (ngModelChange)="updateStatus(order.id, $event)" class="text-xs py-1 px-2 bg-champagne-50 border border-champagne-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-300 transition">
                      <option value="Confirmed">Confirmed</option>
                      <option value="DesignApproved">Design Approved</option>
                      <option value="InProduction">In Production</option>
                      <option value="QualityCheck">Quality Check</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="OutForDelivery">Out For Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td class="px-5 py-3.5 space-x-3">
                    <button (click)="generateInvoice(order.id)" class="text-champagne-600 text-xs font-medium hover:text-champagne-800 transition-colors">Invoice</button>
                    <button (click)="generateCertificate(order)" class="text-champagne-600 text-xs font-medium hover:text-champagne-800 transition-colors">Certificate</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="mt-5 flex justify-between items-center">
          <p class="text-xs text-champagne-500">Showing {{ orders().length }} of {{ totalCount() }} orders</p>
          <div class="space-x-2">
            <button (click)="prevPage()" [disabled]="currentPage() <= 1" class="px-4 py-1.5 border border-champagne-200 rounded-full text-xs font-medium text-champagne-700 hover:bg-champagne-50 disabled:opacity-40 transition-colors">Prev</button>
            <button (click)="nextPage()" [disabled]="orders().length < 20" class="px-4 py-1.5 border border-champagne-200 rounded-full text-xs font-medium text-champagne-700 hover:bg-champagne-50 disabled:opacity-40 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  orders = signal<any[]>([]);
  totalCount = signal(0);
  currentPage = signal(1);
  statusFilter = '';

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.adminService.getOrders(this.currentPage(), 20, this.statusFilter || undefined).subscribe(result => {
      this.orders.set(result.items);
      this.totalCount.set(result.totalCount);
    });
  }

  updateStatus(orderId: string, status: string) {
    this.adminService.updateOrderStatus(orderId, status).subscribe();
  }

  generateInvoice(orderId: string) {
    this.adminService.generateInvoice(orderId).subscribe({
      next: (invoice: any) => {
        if (invoice.pdfUrl) window.open(invoice.pdfUrl, '_blank');
      }
    });
  }

  generateCertificate(order: any) {
    if (order.orderItems?.length > 0) {
      const firstItem = order.orderItems[0];
      this.adminService.generateCertificate(order.id, firstItem.id, 'Gold').subscribe({
        next: (cert: any) => {
          if (cert.pdfUrl) window.open(cert.pdfUrl, '_blank');
        }
      });
    }
  }

  prevPage() {
    this.currentPage.update(p => Math.max(1, p - 1));
    this.loadOrders();
  }

  nextPage() {
    this.currentPage.update(p => p + 1);
    this.loadOrders();
  }
}
