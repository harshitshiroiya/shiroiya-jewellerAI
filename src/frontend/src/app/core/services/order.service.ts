import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Order, Address } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly apiUrl = `${environment.apiUrl}/orders`;
  private readonly addressUrl = `${environment.apiUrl}/addresses`;

  constructor(private http: HttpClient) {}

  getOrders() {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrder(id: string) {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  createOrder(shippingAddressId: string, promoCode?: string) {
    return this.http.post<{ id: string; orderNumber: string; totalAmount: number; clientSecret: string }>(
      this.apiUrl, { shippingAddressId, promoCode }
    );
  }

  confirmPayment(orderId: string) {
    return this.http.post<{ paymentStatus: string }>(`${this.apiUrl}/${orderId}/confirm-payment`, {});
  }

  getAddresses() {
    return this.http.get<Address[]>(this.addressUrl);
  }

  createAddress(address: Omit<Address, 'id'>) {
    return this.http.post<Address>(this.addressUrl, address);
  }

  updateAddress(id: string, address: Omit<Address, 'id'>) {
    return this.http.put<Address>(`${this.addressUrl}/${id}`, address);
  }

  deleteAddress(id: string) {
    return this.http.delete(`${this.addressUrl}/${id}`);
  }
}
