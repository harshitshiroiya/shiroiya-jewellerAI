import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  inProduction: number;
  totalProducts: number;
  totalCustomers: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getStats() {
    return this.http.get<AdminStats>(`${this.apiUrl}/orders/stats`);
  }

  getOrders(page = 1, pageSize = 20, status?: string) {
    let url = `${this.apiUrl}/orders?page=${page}&pageSize=${pageSize}`;
    if (status) url += `&status=${status}`;
    return this.http.get<PaginatedResult<any>>(url);
  }

  getOrder(id: string) {
    return this.http.get<any>(`${this.apiUrl}/orders/${id}`);
  }

  updateOrderStatus(id: string, status: string, notes?: string) {
    return this.http.put(`${this.apiUrl}/orders/${id}/status`, { status, notes });
  }

  generateInvoice(orderId: string) {
    return this.http.post<any>(`${this.apiUrl}/orders/${orderId}/invoice`, {});
  }

  generateCertificate(orderId: string, itemId: string, certificateType: string, metadata?: string) {
    return this.http.post<any>(`${this.apiUrl}/orders/${orderId}/items/${itemId}/certificate`, { certificateType, metadata });
  }

  createProduct(product: Product) {
    return this.http.post<Product>(`${this.apiUrl}/products`, product);
  }

  updateProduct(id: string, product: Product) {
    return this.http.put<Product>(`${this.apiUrl}/products/${id}`, product);
  }

  deleteProduct(id: string) {
    return this.http.delete(`${this.apiUrl}/products/${id}`);
  }

  getPromotions() {
    return this.http.get<any[]>(`${environment.apiUrl}/promotions`);
  }

  createPromotion(promo: any) {
    return this.http.post(`${environment.apiUrl}/promotions`, promo);
  }

  updatePromotion(id: string, promo: any) {
    return this.http.put(`${environment.apiUrl}/promotions/${id}`, promo);
  }

  deletePromotion(id: string) {
    return this.http.delete(`${environment.apiUrl}/promotions/${id}`);
  }
}
