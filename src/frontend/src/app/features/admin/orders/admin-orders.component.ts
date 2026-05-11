import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-6 py-8">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold">Order Management</h1>
          <select [(ngModel)]="statusFilter" (ngModelChange)="loadOrders()" class="px-4 py-2 border rounded-lg">
            <option value="">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="DesignApproved">Design Approved</option>
            <option value="InProduction">In Production</option>
            <option value="QualityCheck">Quality Check</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>

        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Order #</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Items</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Total</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Payment</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (order of orders(); track order.id) {
                <tr class="border-t hover:bg-gray-50">
                  <td class="px-4 py-3 font-medium">{{ order.orderNumber }}</td>
                  <td class="px-4 py-3 text-sm">{{ order.createdAt | date:'mediumDate' }}</td>
                  <td class="px-4 py-3 text-sm">{{ order.orderItems?.length }}</td>
                  <td class="px-4 py-3 font-bold text-amber-600">₹{{ order.totalAmount | number }}</td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-0.5 rounded text-xs"
                      [class.bg-green-100]="order.paymentStatus === 'Succeeded'"
                      [class.text-green-700]="order.paymentStatus === 'Succeeded'"
                      [class.bg-yellow-100]="order.paymentStatus === 'Pending'"
                      [class.text-yellow-700]="order.paymentStatus === 'Pending'">
                      {{ order.paymentStatus }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <select [ngModel]="order.status" (ngModelChange)="updateStatus(order.id, $event)" class="text-sm p-1 border rounded">
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
                  <td class="px-4 py-3 space-x-2">
                    <button (click)="generateInvoice(order.id)" class="text-green-600 text-sm hover:underline">Invoice</button>
                    <button (click)="generateCertificate(order)" class="text-blue-600 text-sm hover:underline">Certificate</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex justify-between items-center">
          <p class="text-sm text-gray-500">Showing {{ orders().length }} of {{ totalCount() }} orders</p>
          <div class="space-x-2">
            <button (click)="prevPage()" [disabled]="currentPage() <= 1" class="px-3 py-1 border rounded text-sm disabled:opacity-50">Prev</button>
            <button (click)="nextPage()" [disabled]="orders().length < 20" class="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
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
