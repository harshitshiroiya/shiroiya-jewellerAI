import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product, ProductFilter } from '../../../core/models/product.model';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-6 py-8">
        <h1 class="text-3xl font-bold mb-8">Our Collection</h1>

        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Filters Sidebar -->
          <aside class="w-full lg:w-64 space-y-6">
            <div class="bg-white p-4 rounded-xl shadow-sm">
              <h3 class="font-semibold mb-3">Metal Type</h3>
              <select [(ngModel)]="filter.metal" (ngModelChange)="loadProducts()" class="w-full p-2 border rounded-lg">
                <option [ngValue]="undefined">All Metals</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Platinum">Platinum</option>
                <option value="RoseGold">Rose Gold</option>
              </select>
            </div>

            <div class="bg-white p-4 rounded-xl shadow-sm">
              <h3 class="font-semibold mb-3">Stone Type</h3>
              <select [(ngModel)]="filter.stone" (ngModelChange)="loadProducts()" class="w-full p-2 border rounded-lg">
                <option [ngValue]="undefined">All Stones</option>
                <option value="Diamond">Diamond</option>
                <option value="Ruby">Ruby</option>
                <option value="Emerald">Emerald</option>
                <option value="Sapphire">Sapphire</option>
              </select>
            </div>

            <div class="bg-white p-4 rounded-xl shadow-sm">
              <h3 class="font-semibold mb-3">Price Range</h3>
              <div class="flex gap-2">
                <input type="number" [(ngModel)]="filter.minPrice" placeholder="Min" class="w-full p-2 border rounded-lg" />
                <input type="number" [(ngModel)]="filter.maxPrice" placeholder="Max" class="w-full p-2 border rounded-lg" />
              </div>
              <button (click)="loadProducts()" class="mt-2 w-full py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium">Apply</button>
            </div>
          </aside>

          <!-- Product Grid -->
          <main class="flex-1">
            <div class="flex justify-between items-center mb-6">
              <p class="text-gray-600">{{ totalCount() }} products found</p>
              <select [(ngModel)]="filter.sort" (ngModelChange)="loadProducts()" class="p-2 border rounded-lg">
                <option value="name_asc">Name A-Z</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (product of products(); track product.id) {
                <a [routerLink]="['/catalog', product.id]" class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition group">
                  <div class="aspect-square bg-gray-100 flex items-center justify-center">
                    @if (product.imageUrls.length > 0) {
                      <img [src]="product.imageUrls[0]" [alt]="product.name" class="w-full h-full object-cover" />
                    } @else {
                      <span class="text-4xl">💎</span>
                    }
                  </div>
                  <div class="p-4">
                    <h3 class="font-semibold text-gray-900 group-hover:text-amber-600">{{ product.name }}</h3>
                    <p class="text-sm text-gray-500 mt-1">{{ product.metalType }} {{ product.purity }} | {{ product.weightInGrams }}g</p>
                    <div class="mt-2 flex items-center gap-2">
                      <span class="text-lg font-bold text-amber-600">₹{{ product.sellingPrice | number }}</span>
                      @if (product.discountPercent > 0) {
                        <span class="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">{{ product.discountPercent }}% OFF</span>
                      }
                    </div>
                  </div>
                </a>
              }
            </div>
          </main>
        </div>
      </div>
    </div>
  `
})
export class CatalogListComponent implements OnInit {
  products = signal<Product[]>([]);
  totalCount = signal(0);
  filter: ProductFilter = { page: 1, pageSize: 20, sort: 'name_asc' };

  constructor(private productService: ProductService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['category']) this.filter.category = params['category'];
      if (params['type']) this.filter.type = params['type'];
      this.loadProducts();
    });
  }

  loadProducts() {
    this.productService.getProducts(this.filter).subscribe({
      next: response => {
        this.products.set(response.items);
        this.totalCount.set(response.totalCount);
      }
    });
  }
}
