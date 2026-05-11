import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

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
                    @if (isStepComplete(i, o.status)) { ✓ } @else { {{ i + 1 }} }
                  </div>
                  <span class="text-xs mt-2 text-center max-w-[80px]">{{ step }}</span>
                </div>
              }
            </div>

            @if (o.statusHistory && o.statusHistory.length > 0) {
              <div class="mt-6 border-t pt-4">
                <h3 class="text-sm font-semibold mb-2">Status History</h3>
                <div class="space-y-2">
                  @for (entry of o.statusHistory; track entry.createdAt) {
                    <div class="flex justify-between text-sm">
                      <span>{{ entry.fromStatus }} → {{ entry.toStatus }}</span>
                      <span class="text-gray-500">{{ entry.createdAt | date:'short' }}</span>
                    </div>
                    @if (entry.notes) {
                      <p class="text-xs text-gray-500 ml-4">{{ entry.notes }}</p>
                    }
                  }
                </div>
              </div>
            }
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Order Items -->
            <div class="bg-white rounded-xl p-6 shadow-sm">
              <h2 class="text-xl font-bold mb-4">Items</h2>
              <div class="space-y-3">
                @for (item of o.orderItems; track item.id) {
                  <div class="flex justify-between py-3 border-b last:border-0">
                    <div>
                      <p class="font-medium">{{ getItemName(item.productSnapshot) }}</p>
                      <p class="text-sm text-gray-500">Qty: {{ item.quantity }}</p>
                    </div>
                    <span class="font-bold text-amber-600">₹{{ item.totalPrice | number }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Payment & Documents -->
            <div class="space-y-6">
              <div class="bg-white rounded-xl p-6 shadow-sm">
                <h2 class="text-xl font-bold mb-4">Payment Summary</h2>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between"><span>Subtotal</span><span>₹{{ o.subTotal | number }}</span></div>
                  <div class="flex justify-between"><span>Tax</span><span>₹{{ o.taxAmount | number }}</span></div>
                  <div class="flex justify-between"><span>Shipping</span><span>{{ o.shippingCost === 0 ? 'Free' : '₹' + o.shippingCost }}</span></div>
                  <hr />
                  <div class="flex justify-between font-bold text-lg"><span>Total</span><span class="text-amber-600">₹{{ o.totalAmount | number }}</span></div>
                  <div class="flex justify-between mt-2">
                    <span>Payment Status</span>
                    <span class="px-2 py-0.5 rounded text-xs font-medium"
                      [class.bg-green-100]="o.paymentStatus === 'Succeeded'"
                      [class.text-green-700]="o.paymentStatus === 'Succeeded'"
                      [class.bg-yellow-100]="o.paymentStatus === 'Pending'"
                      [class.text-yellow-700]="o.paymentStatus === 'Pending'">
                      {{ o.paymentStatus }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-xl p-6 shadow-sm">
                <h2 class="text-xl font-bold mb-4">Documents</h2>
                <div class="space-y-2">
                  <button (click)="downloadInvoice()" class="w-full py-3 border rounded-lg text-sm hover:bg-gray-50 font-medium">
                    📄 Download Invoice
                  </button>
                  <button (click)="downloadCertificates()" class="w-full py-3 border rounded-lg text-sm hover:bg-gray-50 font-medium">
                    🏅 Download Certificates
                  </button>
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

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderService.getOrder(id).subscribe(order => this.order.set(order));
    }
  }

  isStepComplete(stepIndex: number, currentStatus: string): boolean {
    const statusOrder = ['Confirmed', 'DesignApproved', 'InProduction', 'QualityCheck', 'Dispatched', 'Delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    return stepIndex <= currentIndex;
  }

  getItemName(snapshot: string): string {
    try {
      const parsed = JSON.parse(snapshot);
      return parsed.Name || parsed.name || 'Item';
    } catch {
      return 'Item';
    }
  }

  downloadInvoice() {
    const o = this.order();
    if (o && (o as any).invoice?.pdfUrl) {
      window.open((o as any).invoice.pdfUrl, '_blank');
    }
  }

  downloadCertificates() {
    const o = this.order();
    if (o) {
      for (const item of o.orderItems) {
        const certs = (item as any).certificates;
        if (certs) {
          for (const cert of certs) {
            if (cert.pdfUrl) window.open(cert.pdfUrl, '_blank');
          }
        }
      }
    }
  }
}
