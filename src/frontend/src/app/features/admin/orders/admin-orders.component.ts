import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Order } from '../../../core/models/order.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-6 py-8">
        <h1 class="text-3xl font-bold mb-8">Order Management</h1>

        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Order #</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Total</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (order of orders(); track order.id) {
                <tr class="border-t">
                  <td class="px-4 py-3 font-medium">{{ order.orderNumber }}</td>
                  <td class="px-4 py-3 text-sm">{{ order.createdAt | date:'mediumDate' }}</td>
                  <td class="px-4 py-3 font-bold text-amber-600">₹{{ order.totalAmount | number }}</td>
                  <td class="px-4 py-3">
                    <select [(ngModel)]="order.status" (ngModelChange)="updateStatus(order.id, $event)" class="text-sm p-1 border rounded">
                      <option value="Confirmed">Confirmed</option>
                      <option value="DesignApproved">Design Approved</option>
                      <option value="InProduction">In Production</option>
                      <option value="QualityCheck">Quality Check</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td class="px-4 py-3 space-x-2">
                    <button (click)="uploadCertificate(order.id)" class="text-blue-600 text-sm hover:underline">Certificate</button>
                    <button (click)="generateInvoice(order.id)" class="text-green-600 text-sm hover:underline">Invoice</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  orders = signal<Order[]>([]);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<Order[]>(`${environment.apiUrl}/admin/orders`).subscribe({
      next: orders => this.orders.set(orders)
    });
  }

  updateStatus(orderId: string, status: string) {
    this.http.put(`${environment.apiUrl}/admin/orders/${orderId}/status`, { status }).subscribe();
  }

  uploadCertificate(orderId: string) {
    // In a full implementation, this would open a file picker
    alert('Certificate upload dialog would open here');
  }

  generateInvoice(orderId: string) {
    this.http.post(`${environment.apiUrl}/admin/invoices/${orderId}/regenerate`, {}).subscribe({
      next: () => alert('Invoice generated successfully')
    });
  }
}
