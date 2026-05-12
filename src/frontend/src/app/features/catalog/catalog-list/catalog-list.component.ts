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
    <div class="min-h-screen bg-stone-50">
      <div class="bg-white border-b border-stone-100">
        <div class="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <p class="text-amber-700 text-xs font-semibold tracking-[0.2em] uppercase mb-2">Our Collection</p>
          <h1 class="text-3xl font-bold text-stone-900 tracking-tight">Curated Pieces</h1>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div class="flex flex-col lg:flex-row gap-8">
          <aside class="w-full lg:w-56 shrink-0 space-y-5">
            <div class="bg-white border border-stone-100 rounded-lg p-4">
              <h3 class="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-3">Metal</h3>
              <select [(ngModel)]="filter.metal" (ngModelChange)="loadProducts()"
                class="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600">
                <option [ngValue]="undefined">All Metals</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Platinum">Platinum</option>
                <option value="RoseGold">Rose Gold</option>
              </select>
            </div>

            <div class="bg-white border border-stone-100 rounded-lg p-4">
              <h3 class="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-3">Stone</h3>
              <select [(ngModel)]="filter.stone" (ngModelChange)="loadProducts()"
                class="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600">
                <option [ngValue]="undefined">All Stones</option>
                <option value="Diamond">Diamond</option>
                <option value="Ruby">Ruby</option>
                <option value="Emerald">Emerald</option>
                <option value="Sapphire">Sapphire</option>
              </select>
            </div>

            <div class="bg-white border border-stone-100 rounded-lg p-4">
              <h3 class="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-3">Price</h3>
              <div class="space-y-2">
                <input type="number" [(ngModel)]="filter.minPrice" placeholder="Min"
                  class="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600" />
                <input type="number" [(ngModel)]="filter.maxPrice" placeholder="Max"
                  class="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600" />
              </div>
              <button (click)="loadProducts()"
                class="mt-3 w-full py-2 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100 transition-colors">
                Apply Filter
              </button>
            </div>
          </aside>

          <main class="flex-1">
            <div class="flex justify-between items-center mb-6">
              <p class="text-sm text-stone-500">{{ totalCount() }} pieces</p>
              <select [(ngModel)]="filter.sort" (ngModelChange)="loadProducts()"
                class="px-3 py-2 bg-white border border-stone-200 rounded text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600">
                <option value="name_asc">Name A–Z</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              @for (product of products(); track product.id) {
                <a [routerLink]="['/catalog', product.id]"
                  class="group bg-white rounded-lg overflow-hidden border border-stone-100 hover:border-stone-200 hover:shadow-md transition-all duration-300">
                  <div class="aspect-square bg-stone-100 relative overflow-hidden">
                    @if (product.imageUrls.length > 0) {
                      <img [src]="product.imageUrls[0]" [alt]="product.name"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    } @else {
                      <div class="w-full h-full flex items-center justify-center">
                        <span class="text-5xl opacity-30">&#10022;</span>
                      </div>
                    }
                    @if (product.discountPercent > 0) {
                      <span class="absolute top-3 left-3 text-[11px] font-semibold bg-red-600 text-white px-2 py-0.5 rounded">
                        -{{ product.discountPercent }}%
                      </span>
                    }
                  </div>
                  <div class="p-4">
                    <p class="text-xs text-stone-400 uppercase tracking-wide">{{ product.metalType }} {{ product.purity }}</p>
                    <h3 class="text-sm font-semibold text-stone-900 mt-1 group-hover:text-amber-800 transition-colors">{{ product.name }}</h3>
                    <p class="text-xs text-stone-400 mt-0.5">{{ product.weightInGrams }}g</p>
                    <div class="mt-2.5 flex items-baseline gap-2">
                      <span class="text-base font-bold text-stone-900">&#8377;{{ product.sellingPrice | number }}</span>
                      @if (product.discountPercent > 0) {
                        <span class="text-xs text-stone-400 line-through">&#8377;{{ product.basePrice | number }}</span>
                      }
                    </div>
                  </div>
                </a>
              }
            </div>

            @if (products().length === 0) {
              <div class="text-center py-20">
                <p class="text-stone-400 text-sm">No pieces match your filters.</p>
                <button (click)="resetFilters()" class="mt-3 text-sm font-medium text-amber-700 hover:text-amber-800">Clear all filters</button>
              </div>
            }
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

  resetFilters() {
    this.filter = { page: 1, pageSize: 20, sort: 'name_asc' };
    this.loadProducts();
  }
}
