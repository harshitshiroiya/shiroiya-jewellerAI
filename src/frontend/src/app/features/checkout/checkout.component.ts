import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { Address } from '../../core/models/order.model';

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
            <!-- Saved Addresses -->
            @if (savedAddresses().length > 0) {
              <div class="bg-white rounded-xl p-6 shadow-sm">
                <h2 class="text-xl font-bold mb-4">Saved Addresses</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  @for (addr of savedAddresses(); track addr.id) {
                    <div (click)="selectAddress(addr)"
                      [class.ring-2]="selectedAddressId() === addr.id"
                      [class.ring-amber-500]="selectedAddressId() === addr.id"
                      class="p-4 border rounded-lg cursor-pointer hover:border-amber-300 transition">
                      <p class="font-semibold">{{ addr.label }}</p>
                      <p class="text-sm text-gray-600">{{ addr.line1 }}</p>
                      <p class="text-sm text-gray-600">{{ addr.city }}, {{ addr.state }} {{ addr.postalCode }}</p>
                    </div>
                  }
                </div>
                <button (click)="showNewAddress.set(true)" class="mt-4 text-amber-600 text-sm font-semibold hover:underline">
                  + Add New Address
                </button>
              </div>
            }

            <!-- New Address Form -->
            @if (savedAddresses().length === 0 || showNewAddress()) {
              <div class="bg-white rounded-xl p-6 shadow-sm">
                <h2 class="text-xl font-bold mb-4">Delivery Address</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Label</label>
                    <input type="text" [(ngModel)]="address.label" class="w-full px-4 py-3 border rounded-lg" placeholder="Home, Office" />
                  </div>
                  <div></div>
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
                    <input type="text" [(ngModel)]="address.country" class="w-full px-4 py-3 border rounded-lg" />
                  </div>
                </div>
                <button (click)="saveAddress()" class="mt-4 px-6 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900">
                  Save Address
                </button>
              </div>
            }

            <!-- Promo Code -->
            <div class="bg-white rounded-xl p-6 shadow-sm">
              <h2 class="text-xl font-bold mb-4">Promo Code</h2>
              <div class="flex gap-3">
                <input type="text" [(ngModel)]="promoCode" class="flex-1 px-4 py-3 border rounded-lg" placeholder="Enter promo code" />
                <button (click)="applyPromo()" class="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900">Apply</button>
              </div>
              @if (promoMessage()) {
                <p class="mt-2 text-sm" [class.text-green-600]="promoDiscount() > 0" [class.text-red-600]="promoDiscount() === 0">
                  {{ promoMessage() }}
                </p>
              }
            </div>
          </div>

          <!-- Order Summary -->
          <div class="bg-white rounded-xl p-6 shadow-sm h-fit sticky top-8">
            <h3 class="text-lg font-bold mb-4">Order Summary</h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between"><span>Subtotal</span><span>₹{{ cartService.totalPrice() | number:'1.0-0' }}</span></div>
              <div class="flex justify-between"><span>GST (3%)</span><span>₹{{ cartService.totalPrice() * 0.03 | number:'1.0-0' }}</span></div>
              <div class="flex justify-between"><span>Shipping</span><span class="text-green-600">{{ cartService.totalPrice() > 50000 ? 'Free' : '₹500' }}</span></div>
              @if (promoDiscount() > 0) {
                <div class="flex justify-between text-green-600"><span>Discount</span><span>-₹{{ promoDiscount() | number:'1.0-0' }}</span></div>
              }
              <hr />
              <div class="flex justify-between font-bold text-lg"><span>Total</span><span class="text-amber-600">₹{{ getTotal() | number:'1.0-0' }}</span></div>
            </div>

            <button (click)="placeOrder()" [disabled]="processing() || !selectedAddressId()"
              class="w-full mt-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition disabled:opacity-50">
              {{ processing() ? 'Processing...' : 'Place Order & Pay' }}
            </button>
            @if (!selectedAddressId()) {
              <p class="text-red-500 text-xs mt-2 text-center">Please select or add a delivery address</p>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  processing = signal(false);
  savedAddresses = signal<Address[]>([]);
  selectedAddressId = signal<string | null>(null);
  showNewAddress = signal(false);
  promoCode = '';
  promoMessage = signal('');
  promoDiscount = signal(0);

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
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.orderService.getAddresses().subscribe(addresses => {
      this.savedAddresses.set(addresses);
      const defaultAddr = addresses.find(a => a.isDefault);
      if (defaultAddr?.id) this.selectedAddressId.set(defaultAddr.id);
    });
  }

  selectAddress(addr: Address) {
    this.selectedAddressId.set(addr.id!);
    this.showNewAddress.set(false);
  }

  saveAddress() {
    this.orderService.createAddress(this.address).subscribe(saved => {
      this.savedAddresses.update(addrs => [...addrs, saved]);
      this.selectedAddressId.set(saved.id!);
      this.showNewAddress.set(false);
    });
  }

  applyPromo() {
    if (!this.promoCode.trim()) return;
    const http = (this.orderService as any).http;
    http.post(`${(this.orderService as any).addressUrl.replace('/addresses', '/promotions/validate')}`,
      { code: this.promoCode, orderAmount: this.cartService.totalPrice() }
    ).subscribe({
      next: (res: any) => {
        this.promoDiscount.set(res.discount);
        this.promoMessage.set(`Promo applied! You save ₹${res.discount.toFixed(0)}`);
      },
      error: (err: any) => {
        this.promoDiscount.set(0);
        this.promoMessage.set(err.error?.message || 'Invalid promo code');
      }
    });
  }

  getTotal(): number {
    const sub = this.cartService.totalPrice();
    const tax = sub * 0.03;
    const shipping = sub > 50000 ? 0 : 500;
    return sub + tax + shipping - this.promoDiscount();
  }

  placeOrder() {
    if (!this.selectedAddressId()) return;
    this.processing.set(true);

    this.orderService.createOrder(this.selectedAddressId()!, this.promoCode || undefined).subscribe({
      next: (result) => {
        this.processing.set(false);
        this.router.navigate(['/orders', result.id]);
      },
      error: () => this.processing.set(false)
    });
  }
}
