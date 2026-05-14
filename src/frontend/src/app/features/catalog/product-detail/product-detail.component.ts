import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white">
      @if (product(); as p) {
        <div class="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <nav class="text-xs text-champagne-500 mb-8">
            <a routerLink="/catalog" class="hover:text-champagne-800 transition-colors">Collection</a>
            <span class="mx-2 text-champagne-300">/</span>
            <span class="text-champagne-700">{{ p.name }}</span>
          </nav>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <div class="aspect-square bg-gradient-to-b from-champagne-100 to-champagne-50 rounded-2xl flex items-center justify-center overflow-hidden">
                @if (p.imageUrls.length > 0) {
                  <img [src]="p.imageUrls[selectedImage()]" [alt]="p.name" class="w-full h-full object-cover" />
                } @else {
                  <span class="font-serif text-8xl text-champagne-300 italic">S</span>
                }
              </div>
              @if (p.imageUrls.length > 1) {
                <div class="flex gap-2.5 mt-4">
                  @for (img of p.imageUrls; track img; let i = $index) {
                    <button (click)="selectedImage.set(i)"
                      [class]="selectedImage() === i ? 'ring-2 ring-champagne-500 ring-offset-2' : 'border border-champagne-200'"
                      class="w-16 h-16 rounded-xl overflow-hidden">
                      <img [src]="img" class="w-full h-full object-cover" />
                    </button>
                  }
                </div>
              }
            </div>

            <div>
              <p class="text-[10px] text-champagne-500 uppercase tracking-[0.25em] font-medium">{{ p.metalType }}</p>
              <h1 class="font-serif text-3xl font-light text-champagne-900 italic mt-2">{{ p.name }}</h1>
              <p class="text-sm text-champagne-600/70 mt-4 leading-relaxed">{{ p.description }}</p>

              <div class="mt-8 border-t border-champagne-100 pt-6 space-y-3.5">
                <div class="flex justify-between py-1.5 text-sm">
                  <span class="text-champagne-500">Metal</span>
                  <span class="font-medium text-champagne-800">{{ p.metalType }} ({{ p.purity }})</span>
                </div>
                <div class="flex justify-between py-1.5 text-sm">
                  <span class="text-champagne-500">Weight</span>
                  <span class="font-medium text-champagne-800">{{ p.weightInGrams }}g</span>
                </div>
                @if (p.stoneType !== 'None') {
                  <div class="flex justify-between py-1.5 text-sm">
                    <span class="text-champagne-500">Stone</span>
                    <span class="font-medium text-champagne-800">{{ p.stoneType }} ({{ p.stoneShape }})</span>
                  </div>
                  @if (p.stoneCarat) {
                    <div class="flex justify-between py-1.5 text-sm">
                      <span class="text-champagne-500">Carat</span>
                      <span class="font-medium text-champagne-800">{{ p.stoneCarat }} ct</span>
                    </div>
                  }
                  @if (p.stoneClarity) {
                    <div class="flex justify-between py-1.5 text-sm">
                      <span class="text-champagne-500">Clarity</span>
                      <span class="font-medium text-champagne-800">{{ p.stoneClarity }}</span>
                    </div>
                  }
                }
              </div>

              <div class="mt-8 border-t border-champagne-100 pt-6">
                <div class="flex items-baseline gap-3">
                  <span class="text-3xl font-semibold text-champagne-900">&#8377;{{ p.sellingPrice | number }}</span>
                  @if (p.discountPercent > 0) {
                    <span class="text-sm text-champagne-400 line-through">&#8377;{{ p.basePrice | number }}</span>
                    <span class="text-[10px] font-semibold bg-champagne-100 text-champagne-700 px-2 py-0.5 rounded-full">-{{ p.discountPercent }}%</span>
                  }
                </div>
                <p class="text-xs text-champagne-500 mt-1">Inclusive of all taxes</p>
              </div>

              <div class="mt-8">
                <button (click)="addToCart(p.id)" [disabled]="addingToCart() || p.stockQuantity === 0"
                  class="w-full py-4 bg-champagne-900 text-champagne-50 rounded-full text-sm font-medium hover:bg-champagne-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  {{ addingToCart() ? 'Adding...' : p.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart' }}
                </button>
              </div>

              <p class="mt-3 text-xs text-center"
                [class.text-green-700]="p.stockQuantity > 0"
                [class.text-red-600]="p.stockQuantity === 0">
                @if (p.stockQuantity > 0) {
                  In stock
                } @else {
                  Currently out of stock
                }
              </p>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  selectedImage = signal(0);
  addingToCart = signal(false);

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProduct(id).subscribe({
        next: product => this.product.set(product)
      });
    }
  }

  addToCart(productId: string) {
    this.addingToCart.set(true);
    this.cartService.addItem(productId).subscribe({
      next: () => this.addingToCart.set(false),
      error: () => this.addingToCart.set(false)
    });
  }
}
