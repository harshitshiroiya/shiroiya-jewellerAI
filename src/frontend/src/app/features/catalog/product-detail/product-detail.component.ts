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
        <div class="container mx-auto px-6 py-8">
          <nav class="text-sm text-gray-500 mb-6">
            <a routerLink="/catalog" class="hover:text-amber-600">Catalog</a> / {{ p.name }}
          </nav>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <!-- Image Gallery -->
            <div>
              <div class="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                @if (p.imageUrls.length > 0) {
                  <img [src]="p.imageUrls[selectedImage()]" [alt]="p.name" class="w-full h-full object-cover" />
                } @else {
                  <span class="text-6xl">💎</span>
                }
              </div>
              @if (p.imageUrls.length > 1) {
                <div class="flex gap-2 mt-4">
                  @for (img of p.imageUrls; track img; let i = $index) {
                    <button (click)="selectedImage.set(i)"
                      [class.ring-2]="selectedImage() === i"
                      class="w-16 h-16 rounded-lg overflow-hidden ring-amber-500">
                      <img [src]="img" class="w-full h-full object-cover" />
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Product Info -->
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ p.name }}</h1>
              <p class="text-gray-600 mt-2">{{ p.description }}</p>

              <div class="mt-6 space-y-3">
                <div class="flex justify-between py-2 border-b">
                  <span class="text-gray-500">Metal</span>
                  <span class="font-medium">{{ p.metalType }} ({{ p.purity }})</span>
                </div>
                <div class="flex justify-between py-2 border-b">
                  <span class="text-gray-500">Weight</span>
                  <span class="font-medium">{{ p.weightInGrams }}g</span>
                </div>
                @if (p.stoneType !== 'None') {
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-gray-500">Stone</span>
                    <span class="font-medium">{{ p.stoneType }} ({{ p.stoneShape }})</span>
                  </div>
                  @if (p.stoneCarat) {
                    <div class="flex justify-between py-2 border-b">
                      <span class="text-gray-500">Carat</span>
                      <span class="font-medium">{{ p.stoneCarat }} ct</span>
                    </div>
                  }
                  @if (p.stoneClarity) {
                    <div class="flex justify-between py-2 border-b">
                      <span class="text-gray-500">Clarity</span>
                      <span class="font-medium">{{ p.stoneClarity }}</span>
                    </div>
                  }
                }
              </div>

              <div class="mt-8">
                <div class="flex items-center gap-3">
                  <span class="text-3xl font-bold text-amber-600">₹{{ p.sellingPrice | number }}</span>
                  @if (p.discountPercent > 0) {
                    <span class="text-lg text-gray-400 line-through">₹{{ p.basePrice | number }}</span>
                    <span class="text-sm bg-red-100 text-red-600 px-2 py-1 rounded">{{ p.discountPercent }}% OFF</span>
                  }
                </div>
                <p class="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
              </div>

              <div class="mt-8 flex gap-4">
                <button (click)="addToCart(p.id)" [disabled]="addingToCart()"
                  class="flex-1 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition disabled:opacity-50">
                  {{ addingToCart() ? 'Adding...' : 'Add to Cart' }}
                </button>
              </div>

              <p class="mt-4 text-sm" [class.text-green-600]="p.stockQuantity > 0" [class.text-red-600]="p.stockQuantity === 0">
                {{ p.stockQuantity > 0 ? 'In Stock (' + p.stockQuantity + ' available)' : 'Out of Stock' }}
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
