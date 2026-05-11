import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../core/services/cart.service';
import { Address } from '../../core/models/order.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-6 py-8">
        <h1 class="text-3xl font-bold mb-8">Checkout</h1>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-6">
            <!-- Delivery Address -->
            <div class="bg-white rounded-xl p-6 shadow-sm">
              <h2 class="text-xl font-bold mb-4">Delivery Address</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                  <input type="text" [(ngModel)]="address.line1" class="w-full px-4 py-3 border rounded-lg" placeholder="House/Flat No., Street" />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                  <input type="text" [(ngModel)]="address.line2" class="w-full px-4 py-3 border rounded-lg" placeholder="Landmark, Area" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" [(ngModel)]="address.city" class="w-full px-4 py-3 border rounded-lg" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input type="text" [(ngModel)]="address.state" class="w-full px-4 py-3 border rounded-lg" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input type="text" [(ngModel)]="address.postalCode" class="w-full px-4 py-3 border rounded-lg" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input type="text" [(ngModel)]="address.country" class="w-full px-4 py-3 border rounded-lg" value="India" />
                </div>
              </div>
            </div>

            <!-- Payment -->
            <div class="bg-white rounded-xl p-6 shadow-sm">
              <h2 class="text-xl font-bold mb-4">Payment</h2>
              <p class="text-gray-500 text-sm mb-4">You will be redirected to Stripe's secure payment page.</p>
              <div id="stripe-element" class="p-4 border rounded-lg bg-gray-50"></div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="bg-white rounded-xl p-6 shadow-sm h-fit">
            <h3 class="text-lg font-bold mb-4">Order Summary</h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between"><span>Subtotal</span><span>₹{{ cartService.totalPrice() | number }}</span></div>
              <div class="flex justify-between"><span>GST (3%)</span><span>₹{{ cartService.totalPrice() * 0.03 | number }}</span></div>
              <div class="flex justify-between"><span>Shipping</span><span class="text-green-600">Free</span></div>
              <hr />
              <div class="flex justify-between font-bold text-lg"><span>Total</span><span class="text-amber-600">₹{{ cartService.totalPrice() * 1.03 | number }}</span></div>
            </div>

            <button (click)="placeOrder()" [disabled]="processing()"
              class="w-full mt-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition disabled:opacity-50">
              {{ processing() ? 'Processing...' : 'Place Order & Pay' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CheckoutComponent {
  processing = signal(false);

  address: Address = {
    label: 'Home',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: true
  };

  constructor(
    public cartService: CartService,
    private http: HttpClient,
    private router: Router
  ) {}

  placeOrder() {
    this.processing.set(true);
    this.http.post<any>(`${environment.apiUrl}/orders`, { shippingAddress: this.address }).subscribe({
      next: (order) => {
        this.http.post<any>(`${environment.apiUrl}/payments/create-intent`, { orderId: order.id }).subscribe({
          next: () => {
            this.processing.set(false);
            this.router.navigate(['/orders', order.id]);
          },
          error: () => this.processing.set(false)
        });
      },
      error: () => this.processing.set(false)
    });
  }
}
