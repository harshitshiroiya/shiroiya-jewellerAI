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
    <div class="min-h-screen bg-stone-50">
      <div class="bg-white border-b border-stone-100">
        <div class="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <h1 class="text-3xl font-bold text-stone-900 tracking-tight">Checkout</h1>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-5">
            @if (savedAddresses().length > 0) {
              <div class="bg-white border border-stone-100 rounded-lg p-6">
                <h2 class="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-4">Delivery Address</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  @for (addr of savedAddresses(); track addr.id) {
                    <div (click)="selectAddress(addr)"
                      [class]="selectedAddressId() === addr.id
                        ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-600/20'
                        : 'border-stone-200 hover:border-stone-300'"
                      class="p-4 border rounded-lg cursor-pointer transition-all duration-200">
                      <p class="text-sm font-semibold text-stone-800">{{ addr.label }}</p>
                      <p class="text-xs text-stone-500 mt-1">{{ addr.line1 }}</p>
                      <p class="text-xs text-stone-500">{{ addr.city }}, {{ addr.state }} {{ addr.postalCode }}</p>
                    </div>
                  }
                </div>
                <button (click)="showNewAddress.set(true)" class="mt-4 text-xs font-semibold text-amber-700 hover:text-amber-800">
                  + Add new address
                </button>
              </div>
            }

            @if (savedAddresses().length === 0 || showNewAddress()) {
              <div class="bg-white border border-stone-100 rounded-lg p-6">
                <h2 class="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-4">New Address</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">Label</label>
                    <input type="text" [(ngModel)]="address.label"
                      class="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition"
                      placeholder="Home, Office" />
                  </div>
                  <div></div>
                  <div class="md:col-span-2">
                    <label class="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">Address Line 1</label>
                    <input type="text" [(ngModel)]="address.line1"
                      class="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition"
                      placeholder="House/Flat No., Street" />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">Address Line 2</label>
                    <input type="text" [(ngModel)]="address.line2"
                      class="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition"
                      placeholder="Landmark, Area" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">City</label>
                    <input type="text" [(ngModel)]="address.city"
                      class="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">State</label>
                    <input type="text" [(ngModel)]="address.state"
                      class="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">Postal Code</label>
                    <input type="text" [(ngModel)]="address.postalCode"
                      class="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">Country</label>
                    <input type="text" [(ngModel)]="address.country"
                      class="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition" />
                  </div>
                </div>
                <button (click)="saveAddress()"
                  class="mt-4 px-5 py-2 bg-stone-900 text-white rounded text-xs font-semibold hover:bg-stone-800 transition-colors">
                  Save Address
                </button>
              </div>
            }

            <div class="bg-white border border-stone-100 rounded-lg p-6">
              <h2 class="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-3">Promo Code</h2>
              <div class="flex gap-2">
                <input type="text" [(ngModel)]="promoCode"
                  class="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition"
                  placeholder="Enter code" />
                <button (click)="applyPromo()"
                  class="px-5 py-2.5 bg-stone-900 text-white rounded text-xs font-semibold hover:bg-stone-800 transition-colors">
                  Apply
                </button>
              </div>
              @if (promoMessage()) {
                <p class="mt-2 text-xs font-medium"
                  [class.text-green-700]="promoDiscount() > 0"
                  [class.text-red-600]="promoDiscount() === 0">
                  {{ promoMessage() }}
                </p>
              }
            </div>
          </div>

          <div class="lg:sticky lg:top-24 h-fit">
            <div class="bg-white border border-stone-100 rounded-lg p-6">
              <h3 class="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-4">Order Summary</h3>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>&#8377;{{ cartService.totalPrice() | number:'1.0-0' }}</span>
                </div>
                <div class="flex justify-between text-stone-600">
                  <span>GST (3%)</span>
                  <span>&#8377;{{ cartService.totalPrice() * 0.03 | number:'1.0-0' }}</span>
                </div>
                <div class="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span class="text-green-700 font-medium">{{ cartService.totalPrice() > 50000 ? 'Free' : '&#8377;500' }}</span>
                </div>
                @if (promoDiscount() > 0) {
                  <div class="flex justify-between text-green-700 font-medium">
                    <span>Discount</span>
                    <span>-&#8377;{{ promoDiscount() | number:'1.0-0' }}</span>
                  </div>
                }
                <div class="border-t border-stone-100 pt-3 flex justify-between font-bold text-stone-900">
                  <span>Total</span>
                  <span>&#8377;{{ getTotal() | number:'1.0-0' }}</span>
                </div>
              </div>

              <button (click)="placeOrder()" [disabled]="processing() || !selectedAddressId()"
                class="w-full mt-5 py-2.5 bg-stone-900 text-white rounded text-sm font-semibold hover:bg-stone-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {{ processing() ? 'Processing...' : 'Place Order & Pay' }}
              </button>
              @if (!selectedAddressId()) {
                <p class="text-[11px] text-red-600 mt-2 text-center">Select or add a delivery address</p>
              }
            </div>
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
