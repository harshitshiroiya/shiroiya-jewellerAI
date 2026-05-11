import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="relative h-[70vh] bg-gradient-to-r from-gray-900 to-gray-700 flex items-center">
      <div class="container mx-auto px-6">
        <div class="max-w-2xl text-white">
          <h1 class="text-5xl font-bold leading-tight mb-4">Discover Your Perfect Jewellery</h1>
          <p class="text-xl text-gray-300 mb-8">AI-powered recommendations and custom 3D design. Create something truly unique.</p>
          <div class="flex gap-4">
            <a routerLink="/ai-assistant" class="px-8 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition">
              Ask AI Assistant
            </a>
            <a routerLink="/custom-design" class="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition">
              Design Your Own
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 bg-white">
      <div class="container mx-auto px-6">
        <h2 class="text-3xl font-bold text-center mb-12">Shop by Category</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          @for (cat of categories; track cat.slug) {
            <a [routerLink]="['/catalog']" [queryParams]="{category: cat.slug}"
              class="group text-center p-6 rounded-xl border hover:shadow-lg transition">
              <div class="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center text-2xl">{{ cat.icon }}</div>
              <h3 class="font-semibold text-gray-900 group-hover:text-amber-600">{{ cat.name }}</h3>
            </a>
          }
        </div>
      </div>
    </section>

    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-6">
        <h2 class="text-3xl font-bold text-center mb-12">Featured Collection</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          @for (product of featuredProducts(); track product.id) {
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
                <p class="text-sm text-gray-500">{{ product.metalType }} | {{ product.stoneType }}</p>
                <div class="mt-2 flex items-center gap-2">
                  <span class="text-lg font-bold text-amber-600">₹{{ product.sellingPrice | number }}</span>
                  @if (product.discountPercent > 0) {
                    <span class="text-sm text-gray-400 line-through">₹{{ product.basePrice | number }}</span>
                  }
                </div>
              </div>
            </a>
          }
        </div>
      </div>
    </section>

    <section class="py-16 bg-gradient-to-r from-amber-500 to-rose-500 text-white">
      <div class="container mx-auto px-6 text-center">
        <h2 class="text-3xl font-bold mb-4">Not sure what to pick?</h2>
        <p class="text-xl mb-8 opacity-90">Our AI assistant will help you find the perfect piece based on your occasion, style, and budget.</p>
        <a routerLink="/ai-assistant" class="inline-block px-8 py-3 bg-white text-amber-600 rounded-lg font-semibold hover:bg-gray-100 transition">
          Chat with AI Assistant
        </a>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  featuredProducts = signal<Product[]>([]);

  categories = [
    { name: 'Rings', slug: 'rings', icon: '💍' },
    { name: 'Earrings', slug: 'earrings', icon: '✨' },
    { name: 'Necklaces', slug: 'necklaces', icon: '📿' },
    { name: 'Bracelets', slug: 'bracelets', icon: '⌚' }
  ];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getFeaturedProducts().subscribe({
      next: products => this.featuredProducts.set(products),
      error: () => {}
    });
  }
}
