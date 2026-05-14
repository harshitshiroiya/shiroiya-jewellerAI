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
    <div class="min-h-screen bg-champagne-50">
      @if (order(); as o) {
        <div class="max-w-5xl mx-auto px-6 py-10">
          <h1 class="font-serif text-3xl font-light text-champagne-900 italic mb-1">Order {{ o.orderNumber }}</h1>
          <p class="text-sm text-champagne-500 mb-10">Placed on {{ o.createdAt | date:'fullDate' }}</p>

          <div class="bg-white rounded-2xl p-7 border border-champagne-100 mb-8">
            <h2 class="text-[11px] font-semibold text-champagne-700 uppercase tracking-[0.15em] mb-6">Order Tracking</h2>
            <div class="flex items-center justify-between relative">
              @for (step of trackingSteps; track step; let i = $index) {
                <div class="flex flex-col items-center z-10">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                    [class.bg-champagne-600]="isStepComplete(i, o.status)"
                    [class.text-white]="isStepComplete(i, o.status)"
                    [class.bg-champagne-100]="!isStepComplete(i, o.status)"
                    [class.text-champagne-500]="!isStepComplete(i, o.status)">
                    @if (isStepComplete(i, o.status)) { &#10003; } @else { {{ i + 1 }} }
                  </div>
                  <span class="text-[11px] mt-2 text-center max-w-[80px] text-champagne-600">{{ step }}</span>
                </div>
              }
            </div>

            @if (o.statusHistory && o.statusHistory.length > 0) {
              <div class="mt-6 border-t border-champagne-100 pt-5">
                <h3 class="text-[11px] font-semibold text-champagne-700 uppercase tracking-[0.15em] mb-3">History</h3>
                <div class="space-y-2">
                  @for (entry of o.statusHistory; track entry.createdAt) {
                    <div class="flex justify-between text-sm">
                      <span class="text-champagne-700">{{ entry.fromStatus }} &rarr; {{ entry.toStatus }}</span>
                      <span class="text-champagne-500">{{ entry.createdAt | date:'short' }}</span>
                    </div>
                    @if (entry.notes) {
                      <p class="text-xs text-champagne-500 ml-4">{{ entry.notes }}</p>
                    }
                  }
                </div>
              </div>
            }
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-white rounded-2xl p-7 border border-champagne-100">
              <h2 class="text-[11px] font-semibold text-champagne-700 uppercase tracking-[0.15em] mb-5">Items</h2>
              <div class="space-y-3">
                @for (item of o.orderItems; track item.id) {
                  <div class="flex justify-between py-3 border-b border-champagne-100 last:border-0">
                    <div>
                      <p class="text-sm font-medium text-champagne-900">{{ getItemName(item.productSnapshot) }}</p>
                      <p class="text-xs text-champagne-500">Qty: {{ item.quantity }}</p>
                    </div>
                    <span class="text-sm font-semibold text-champagne-800">&#8377;{{ item.totalPrice | number }}</span>
                  </div>
                }
              </div>
            </div>

            <div class="space-y-6">
              <div class="bg-white rounded-2xl p-7 border border-champagne-100">
                <h2 class="text-[11px] font-semibold text-champagne-700 uppercase tracking-[0.15em] mb-5">Payment</h2>
                <div class="space-y-2.5 text-sm">
                  <div class="flex justify-between text-champagne-600"><span>Subtotal</span><span>&#8377;{{ o.subTotal | number }}</span></div>
                  <div class="flex justify-between text-champagne-600"><span>Tax</span><span>&#8377;{{ o.taxAmount | number }}</span></div>
                  <div class="flex justify-between text-champagne-600"><span>Shipping</span><span>{{ o.shippingCost === 0 ? 'Free' : '&#8377;' + o.shippingCost }}</span></div>
                  <div class="border-t border-champagne-100 pt-3 flex justify-between font-semibold text-champagne-900 text-base">
                    <span>Total</span><span>&#8377;{{ o.totalAmount | number }}</span>
                  </div>
                  <div class="flex justify-between mt-2">
                    <span class="text-champagne-600">Status</span>
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-medium"
                      [class.bg-green-50]="o.paymentStatus === 'Succeeded'"
                      [class.text-green-700]="o.paymentStatus === 'Succeeded'"
                      [class.bg-yellow-50]="o.paymentStatus === 'Pending'"
                      [class.text-yellow-700]="o.paymentStatus === 'Pending'">
                      {{ o.paymentStatus }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-2xl p-7 border border-champagne-100">
                <h2 class="text-[11px] font-semibold text-champagne-700 uppercase tracking-[0.15em] mb-4">Documents</h2>
                <div class="space-y-2">
                  <button (click)="downloadInvoice()" class="w-full py-3 border border-champagne-200 rounded-xl text-sm hover:bg-champagne-50 font-medium text-champagne-700 transition-colors">
                    Download Invoice
                  </button>
                  <button (click)="downloadCertificates()" class="w-full py-3 border border-champagne-200 rounded-xl text-sm hover:bg-champagne-50 font-medium text-champagne-700 transition-colors">
                    Download Certificates
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
