import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../../core/models/product.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-6 py-8">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold">Inventory Management</h1>
          <button (click)="showForm.set(!showForm())" class="px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700">
            {{ showForm() ? 'Cancel' : '+ Add Product' }}
          </button>
        </div>

        @if (showForm()) {
          <div class="bg-white rounded-xl p-6 shadow-sm mb-8">
            <h2 class="text-xl font-bold mb-4">{{ editingId ? 'Edit' : 'Add' }} Product</h2>
            <form (ngSubmit)="saveProduct()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input [(ngModel)]="form.name" name="name" placeholder="Product Name" class="px-4 py-3 border rounded-lg" required />
              <input [(ngModel)]="form.sku" name="sku" placeholder="SKU" class="px-4 py-3 border rounded-lg" required />
              <textarea [(ngModel)]="form.description" name="description" placeholder="Description" class="md:col-span-2 px-4 py-3 border rounded-lg"></textarea>
              <select [(ngModel)]="form.metalType" name="metalType" class="px-4 py-3 border rounded-lg">
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Platinum">Platinum</option>
                <option value="RoseGold">Rose Gold</option>
              </select>
              <input [(ngModel)]="form.purity" name="purity" placeholder="Purity (e.g. 22K)" class="px-4 py-3 border rounded-lg" />
              <input [(ngModel)]="form.sellingPrice" name="sellingPrice" type="number" placeholder="Selling Price" class="px-4 py-3 border rounded-lg" />
              <input [(ngModel)]="form.stockQuantity" name="stockQuantity" type="number" placeholder="Stock Qty" class="px-4 py-3 border rounded-lg" />
              <button type="submit" class="md:col-span-2 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700">Save Product</button>
            </form>
          </div>
        }

        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Product</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">SKU</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Price</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Stock</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (product of products(); track product.id) {
                <tr class="border-t">
                  <td class="px-4 py-3 font-medium">{{ product.name }}</td>
                  <td class="px-4 py-3 text-sm text-gray-500">{{ product.sku }}</td>
                  <td class="px-4 py-3">₹{{ product.sellingPrice | number }}</td>
                  <td class="px-4 py-3">{{ product.stockQuantity }}</td>
                  <td class="px-4 py-3 space-x-2">
                    <button (click)="editProduct(product)" class="text-blue-600 text-sm hover:underline">Edit</button>
                    <button (click)="deleteProduct(product.id)" class="text-red-600 text-sm hover:underline">Delete</button>
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
export class AdminProductsComponent implements OnInit {
  products = signal<Product[]>([]);
  showForm = signal(false);
  editingId: string | null = null;
  form: any = { metalType: 'Gold' };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.http.get<any>(`${environment.apiUrl}/products?pageSize=100`).subscribe({
      next: res => this.products.set(res.items)
    });
  }

  saveProduct() {
    const url = this.editingId
      ? `${environment.apiUrl}/admin/products/${this.editingId}`
      : `${environment.apiUrl}/admin/products`;
    const method = this.editingId ? 'put' : 'post';

    this.http[method](url, this.form).subscribe({
      next: () => {
        this.showForm.set(false);
        this.editingId = null;
        this.form = { metalType: 'Gold' };
        this.loadProducts();
      }
    });
  }

  editProduct(product: Product) {
    this.editingId = product.id;
    this.form = { ...product };
    this.showForm.set(true);
  }

  deleteProduct(id: string) {
    this.http.delete(`${environment.apiUrl}/admin/products/${id}`).subscribe({
      next: () => this.loadProducts()
    });
  }
}
