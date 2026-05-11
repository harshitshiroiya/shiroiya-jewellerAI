import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartItem } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/cart`;
  private cartItems = signal<CartItem[]>([]);

  items = this.cartItems.asReadonly();
  itemCount = computed(() => this.cartItems().reduce((sum, item) => sum + item.quantity, 0));
  totalPrice = computed(() => this.cartItems().reduce((sum, item) => sum + item.unitPrice * item.quantity, 0));

  constructor(private http: HttpClient) {}

  loadCart() {
    return this.http.get<CartItem[]>(this.apiUrl).pipe(
      tap(items => this.cartItems.set(items))
    );
  }

  addItem(productId: string, quantity: number = 1) {
    return this.http.post(this.apiUrl, { productId, quantity }).pipe(
      tap(() => this.loadCart().subscribe())
    );
  }

  addCustomDesign(customDesignId: string) {
    return this.http.post(this.apiUrl, { customDesignId, quantity: 1 }).pipe(
      tap(() => this.loadCart().subscribe())
    );
  }

  updateQuantity(itemId: string, quantity: number) {
    return this.http.put(`${this.apiUrl}/${itemId}`, { quantity }).pipe(
      tap(() => this.loadCart().subscribe())
    );
  }

  removeItem(itemId: string) {
    return this.http.delete(`${this.apiUrl}/${itemId}`).pipe(
      tap(() => this.loadCart().subscribe())
    );
  }

  clearCart() {
    return this.http.delete(this.apiUrl).pipe(
      tap(() => this.cartItems.set([]))
    );
  }
}
