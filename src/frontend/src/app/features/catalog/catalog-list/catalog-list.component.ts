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
    <div class="min-h-screen bg-champagne-50">
      <div class="bg-white border-b border-champagne-100">
        <div class="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <p class="text-champagne-500 text-[11px] font-semibold tracking-[0.3em] uppercase mb-2">Our Collection</p>
          <h1 class="font-serif text-4xl font-light text-champagne-900 italic">Curated Pieces</h1>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div class="flex flex-col lg:flex-row gap-8">
          <aside class="w-full lg:w-60 shrink-0 space-y-5">
            <div class="bg-white border border-champagne-100 rounded-xl p-5">
              <h3 class="text-[11px] font-semibold text-champagne-700 uppercase tracking-[0.15em] mb-3">Metal</h3>
              <select [(ngModel)]="filter.metal" (ngModelChange)="loadProducts()"
                class="w-full px-3.5 py-2.5 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm text-champagne-800 focus:outline-none focus:ring-2 focus:ring-champagne-300 focus:border-champagne-400">
                <option [ngValue]="undefined">All Metals</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Platinum">Platinum</option>
                <option value="RoseGold">Rose Gold</option>
              </select>
            </div>

            <div class="bg-white border border-champagne-100 rounded-xl p-5">
              <h3 class="text-[11px] font-semibold text-champagne-700 uppercase tracking-[0.15em] mb-3">Stone</h3>
              <select [(ngModel)]="filter.stone" (ngModelChange)="loadProducts()"
                class="w-full px-3.5 py-2.5 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm text-champagne-800 focus:outline-none focus:ring-2 focus:ring-champagne-300 focus:border-champagne-400">
                <option [ngValue]="undefined">All Stones</option>
                <option value="Diamond">Diamond</option>
                <option value="Ruby">Ruby</option>
                <option value="Emerald">Emerald</option>
                <option value="Sapphire">Sapphire</option>
              </select>
            </div>

            <div class="bg-white border border-champagne-100 rounded-xl p-5">
              <h3 class="text-[11px] font-semibold text-champagne-700 uppercase tracking-[0.15em] mb-3">Price Range</h3>
              <div class="space-y-2">
                <input type="number" [(ngModel)]="filter.minPrice" placeholder="Min"
                  class="w-full px-3.5 py-2.5 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 focus:border-champagne-400" />
                <input type="number" [(ngModel)]="filter.maxPrice" placeholder="Max"
                  class="w-full px-3.5 py-2.5 bg-champagne-50/50 border border-champagne-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-champagne-300 focus:border-champagne-400" />
              </div>
              <button (click)="loadProducts()"
                class="mt-3 w-full py-2.5 text-xs font-medium text-champagne-800 bg-champagne-100 border border-champagne-200 rounded-lg hover:bg-champagne-200 transition-colors">
                Apply
              </button>
            </div>
          </aside>

          <main class="flex-1">
            <div class="flex justify-between items-center mb-6">
              <p class="text-sm text-champagne-600">{{ totalCount() }} pieces</p>
              <select [(ngModel)]="filter.sort" (ngModelChange)="loadProducts()"
                class="px-3.5 py-2.5 bg-white border border-champagne-200 rounded-lg text-sm text-champagne-700 focus:outline-none focus:ring-2 focus:ring-champagne-300 focus:border-champagne-400">
                <option value="name_asc">Name A-Z</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              @for (product of products(); track product.id) {
                <a [routerLink]="['/catalog', product.id]"
                  class="group bg-white rounded-2xl overflow-hidden border border-champagne-100 hover:border-champagne-300 hover:shadow-xl hover:shadow-champagne-200/30 transition-all duration-500">
                  <div class="aspect-square bg-gradient-to-b from-champagne-100 to-champagne-50 relative overflow-hidden">
                    @if (product.imageUrls.length > 0) {
                      <img [src]="product.imageUrls[0]" [alt]="product.name"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    } @else {
                      <div class="w-full h-full flex items-center justify-center">
                        <span class="font-serif text-5xl text-champagne-300 italic">S</span>
                      </div>
                    }
                    @if (product.discountPercent > 0) {
                      <span class="absolute top-3 left-3 text-[10px] font-semibold bg-champagne-900 text-champagne-50 px-2.5 py-1 rounded-full">
                        -{{ product.discountPercent }}%
                      </span>
                    }
                  </div>
                  <div class="p-5">
                    <p class="text-[10px] text-champagne-500 uppercase tracking-[0.2em]">{{ product.metalType }} {{ product.purity }}</p>
                    <h3 class="font-serif text-base text-champagne-900 mt-1.5 group-hover:text-champagne-700 transition-colors">{{ product.name }}</h3>
                    <p class="text-xs text-champagne-500 mt-0.5">{{ product.weightInGrams }}g</p>
                    <div class="mt-3 flex items-baseline gap-2">
                      <span class="text-lg font-semibold text-champagne-900">&#8377;{{ product.sellingPrice | number }}</span>
                      @if (product.discountPercent > 0) {
                        <span class="text-xs text-champagne-400 line-through">&#8377;{{ product.basePrice | number }}</span>
                      }
                    </div>
                  </div>
                </a>
              }
            </div>

            @if (products().length === 0) {
              <div class="text-center py-20">
                <p class="text-champagne-500 text-sm">No pieces match your filters.</p>
                <button (click)="resetFilters()" class="mt-3 text-sm font-medium text-champagne-700 hover:text-champagne-900">Clear all filters</button>
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
