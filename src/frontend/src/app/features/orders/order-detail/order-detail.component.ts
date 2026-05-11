import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Order } from '../../../core/models/order.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      @if (order(); as o) {
        <div class="container mx-auto px-6 py-8">
          <h1 class="text-3xl font-bold mb-2">Order {{ o.orderNumber }}</h1>
          <p class="text-gray-500 mb-8">Placed on {{ o.createdAt | date:'fullDate' }}</p>

          <!-- Order Tracking -->
          <div class="bg-white rounded-xl p-6 shadow-sm mb-8">
            <h2 class="text-xl font-bold mb-6">Order Tracking</h2>
            <div class="flex items-center justify-between relative">
              @for (step of trackingSteps; track step; let i = $index) {
                <div class="flex flex-col items-center z-10">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    [class.bg-amber-600]="isStepComplete(i, o.status)"
                    [class.text-white]="isStepComplete(i, o.status)"
                    [class.bg-gray-200]="!isStepComplete(i, o.status)">
                    {{ i + 1 }}
                  </div>
                  <span class="text-xs mt-2 text-center max-w-[80px]">{{ step }}</span>
                </div>
              }
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Order Items -->
            <div class="bg-white rounded-xl p-6 shadow-sm">
              <h2 class="text-xl font-bold mb-4">Items</h2>
              <div class="space-y-3">
                @for (item of o.orderItems; track item.id) {
                  <div class="flex justify-between py-2 border-b">
                    <span>{{ item.productSnapshot | json }} x{{ item.quantity }}</span>
                    <span class="font-bold">₹{{ item.totalPrice | number }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Payment & Certificates -->
            <div class="space-y-6">
              <div class="bg-white rounded-xl p-6 shadow-sm">
                <h2 class="text-xl font-bold mb-4">Payment</h2>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between"><span>Subtotal</span><span>₹{{ o.subTotal | number }}</span></div>
                  <div class="flex justify-between"><span>Tax</span><span>₹{{ o.taxAmount | number }}</span></div>
                  <div class="flex justify-between"><span>Shipping</span><span>₹{{ o.shippingCost | number }}</span></div>
                  <hr />
                  <div class="flex justify-between font-bold"><span>Total</span><span>₹{{ o.totalAmount | number }}</span></div>
                </div>
              </div>

              <div class="bg-white rounded-xl p-6 shadow-sm">
                <h2 class="text-xl font-bold mb-4">Documents</h2>
                <div class="space-y-2">
                  <button (click)="downloadInvoice()" class="w-full py-2 border rounded-lg text-sm hover:bg-gray-50">Download Invoice</button>
                  <button (click)="downloadCertificates()" class="w-full py-2 border rounded-lg text-sm hover:bg-gray-50">Download Certificates</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class OrderDetailComponent implements OnInit {
  order = signal<Order | null>(null);

  trackingSteps = ['Confirmed', 'Design Approved', 'In Production', 'Quality Check', 'Dispatched', 'Delivered'];

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<Order>(`${environment.apiUrl}/orders/${id}`).subscribe({
        next: order => this.order.set(order)
      });
    }
  }

  isStepComplete(stepIndex: number, currentStatus: string): boolean {
    const statusOrder = ['Confirmed', 'DesignApproved', 'InProduction', 'QualityCheck', 'Dispatched', 'Delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    return stepIndex <= currentIndex;
  }

  downloadInvoice() {
    const o = this.order();
    if (o) window.open(`${environment.apiUrl}/orders/${o.id}/invoice/download`, '_blank');
  }

  downloadCertificates() {
    const o = this.order();
    if (o) window.open(`${environment.apiUrl}/orders/${o.id}/certificates`, '_blank');
  }
}
