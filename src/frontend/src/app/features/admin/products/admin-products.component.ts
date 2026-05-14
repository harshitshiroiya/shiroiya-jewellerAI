import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-champagne-50">
      <div class="bg-white border-b border-champagne-100">
        <div class="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <a routerLink="/admin" class="text-champagne-500 text-xs font-medium hover:text-champagne-700 transition-colors">&larr; Dashboard</a>
          <p class="text-champagne-500 text-[11px] font-semibold tracking-[0.3em] uppercase mb-2 mt-4">Administration</p>
          <div class="flex justify-between items-end">
            <h1 class="font-serif text-4xl font-light text-champagne-900 italic">Inventory</h1>
            <button (click)="showForm.set(!showForm())" class="px-6 py-3 bg-champagne-900 text-champagne-50 rounded-full text-sm font-medium hover:bg-champagne-800 transition-colors">
              {{ showForm() ? 'Cancel' : '+ Add Product' }}
            </button>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        @if (showForm()) {
          <div class="bg-white rounded-2xl p-7 border border-champagne-100 mb-8">
            <h2 class="text-[11px] font-semibold text-champagne-700 uppercase tracking-[0.15em] mb-5">{{ editingId ? 'Edit' : 'New' }} Product</h2>
            <form (ngSubmit)="saveProduct()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input [(ngModel)]="form.name" name="name" placeholder="Product Name" class="px-4 py-3 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 transition" required />
              <input [(ngModel)]="form.sku" name="sku" placeholder="SKU" class="px-4 py-3 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 transition" required />
              <select [(ngModel)]="form.jewelleryType" name="jewelleryType" class="px-4 py-3 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 transition">
                <option value="Ring">Ring</option>
                <option value="Earring">Earring</option>
                <option value="Necklace">Necklace</option>
                <option value="Bracelet">Bracelet</option>
                <option value="Pendant">Pendant</option>
                <option value="Bangle">Bangle</option>
              </select>
              <textarea [(ngModel)]="form.description" name="description" placeholder="Description" class="md:col-span-2 lg:col-span-3 px-4 py-3 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 transition"></textarea>
              <select [(ngModel)]="form.metalType" name="metalType" class="px-4 py-3 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 transition">
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Platinum">Platinum</option>
                <option value="RoseGold">Rose Gold</option>
                <option value="WhiteGold">White Gold</option>
              </select>
              <input [(ngModel)]="form.purity" name="purity" placeholder="Purity (e.g. 22K)" class="px-4 py-3 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 transition" />
              <input [(ngModel)]="form.weightInGrams" name="weightInGrams" type="number" step="0.01" placeholder="Weight (grams)" class="px-4 py-3 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 transition" />
              <select [(ngModel)]="form.stoneType" name="stoneType" class="px-4 py-3 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 transition">
                <option value="None">No Stone</option>
                <option value="Diamond">Diamond</option>
                <option value="Ruby">Ruby</option>
                <option value="Emerald">Emerald</option>
                <option value="Sapphire">Sapphire</option>
                <option value="Pearl">Pearl</option>
              </select>
              <input [(ngModel)]="form.basePrice" name="basePrice" type="number" placeholder="Base Price" class="px-4 py-3 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 transition" />
              <input [(ngModel)]="form.sellingPrice" name="sellingPrice" type="number" placeholder="Selling Price" class="px-4 py-3 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 transition" />
              <input [(ngModel)]="form.stockQuantity" name="stockQuantity" type="number" placeholder="Stock Qty" class="px-4 py-3 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 transition" />
              <div class="flex items-center gap-5 text-sm text-champagne-700">
                <label class="flex items-center gap-2"><input type="checkbox" [(ngModel)]="form.isFeatured" name="isFeatured" class="accent-champagne-600" /> Featured</label>
                <label class="flex items-center gap-2"><input type="checkbox" [(ngModel)]="form.isActive" name="isActive" class="accent-champagne-600" /> Active</label>
              </div>
              <button type="submit" class="md:col-span-2 lg:col-span-3 py-3 bg-champagne-900 text-champagne-50 rounded-full text-sm font-medium hover:bg-champagne-800 transition-colors">
                {{ editingId ? 'Update' : 'Create' }} Product
              </button>
            </form>
          </div>
        }

        <div class="bg-white rounded-2xl border border-champagne-100 overflow-hidden">
          <table class="w-full">
            <thead class="bg-champagne-50">
              <tr>
                <th class="px-5 py-3 text-left text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Product</th>
                <th class="px-5 py-3 text-left text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">SKU</th>
                <th class="px-5 py-3 text-left text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Type</th>
                <th class="px-5 py-3 text-left text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Metal</th>
                <th class="px-5 py-3 text-left text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Price</th>
                <th class="px-5 py-3 text-left text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Stock</th>
                <th class="px-5 py-3 text-left text-[10px] font-semibold text-champagne-500 uppercase tracking-[0.15em]">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (product of products(); track product.id) {
                <tr class="border-t border-champagne-100 hover:bg-champagne-50/50 transition-colors">
                  <td class="px-5 py-3.5 text-sm font-medium text-champagne-900">{{ product.name }}</td>
                  <td class="px-5 py-3.5 text-xs text-champagne-500 font-mono">{{ product.sku }}</td>
                  <td class="px-5 py-3.5 text-sm text-champagne-700">{{ product.jewelleryType }}</td>
                  <td class="px-5 py-3.5 text-sm text-champagne-700">{{ product.metalType }}</td>
                  <td class="px-5 py-3.5 text-sm font-semibold text-champagne-800">&#8377;{{ product.sellingPrice | number }}</td>
                  <td class="px-5 py-3.5 text-sm text-champagne-700">{{ product.stockQuantity }}</td>
                  <td class="px-5 py-3.5 space-x-3">
                    <button (click)="editProduct(product)" class="text-champagne-600 text-xs font-medium hover:text-champagne-800 transition-colors">Edit</button>
                    <button (click)="deleteProduct(product.id)" class="text-red-500 text-xs font-medium hover:text-red-700 transition-colors">Delete</button>
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
  form: any = { metalType: 'Gold', jewelleryType: 'Ring', stoneType: 'None', isActive: true, isFeatured: false };

  constructor(private adminService: AdminService, private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts({ pageSize: 100 }).subscribe({
      next: (res: any) => this.products.set(res.items)
    });
  }

  saveProduct() {
    if (this.editingId) {
      this.adminService.updateProduct(this.editingId, this.form).subscribe(() => {
        this.resetForm();
        this.loadProducts();
      });
    } else {
      this.adminService.createProduct(this.form).subscribe(() => {
        this.resetForm();
        this.loadProducts();
      });
    }
  }

  editProduct(product: Product) {
    this.editingId = product.id;
    this.form = { ...product };
    this.showForm.set(true);
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure? This will deactivate the product.')) {
      this.adminService.deleteProduct(id).subscribe(() => this.loadProducts());
    }
  }

  private resetForm() {
    this.showForm.set(false);
    this.editingId = null;
    this.form = { metalType: 'Gold', jewelleryType: 'Ring', stoneType: 'None', isActive: true, isFeatured: false };
  }
}
