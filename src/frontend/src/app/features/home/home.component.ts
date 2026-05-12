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
    <section class="relative min-h-[85vh] bg-stone-950 flex items-center overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-950 to-amber-950/30"></div>
      <div class="absolute top-20 right-20 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 left-20 w-72 h-72 bg-amber-600/5 rounded-full blur-3xl"></div>

      <div class="relative max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div class="max-w-2xl">
          <p class="text-amber-500/80 text-sm font-medium tracking-[0.2em] uppercase mb-6">AI-Powered Jewellery House</p>
          <h1 class="text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
            Where Intelligence<br/>
            <span class="text-amber-400">Meets Elegance</span>
          </h1>
          <p class="text-lg text-stone-400 mt-6 leading-relaxed max-w-lg">
            Discover pieces curated by AI, designed in 3D, and handcrafted with precision. Your jewellery, reimagined.
          </p>
          <div class="flex flex-wrap gap-4 mt-10">
            <a routerLink="/ai-assistant"
              class="px-7 py-3.5 bg-amber-600 text-white text-sm font-semibold tracking-wide hover:bg-amber-500 transition-all duration-200 rounded">
              Talk to AI Stylist
            </a>
            <a routerLink="/catalog"
              class="px-7 py-3.5 border border-stone-600 text-stone-300 text-sm font-semibold tracking-wide hover:border-stone-400 hover:text-white transition-all duration-200 rounded">
              View Collection
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center mb-14">
          <p class="text-amber-700 text-xs font-semibold tracking-[0.2em] uppercase mb-3">Explore</p>
          <h2 class="text-3xl font-bold text-stone-900 tracking-tight">Shop by Category</h2>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
          @for (cat of categories; track cat.slug) {
            <a [routerLink]="['/catalog']" [queryParams]="{category: cat.slug}"
              class="group relative overflow-hidden rounded-lg bg-stone-50 border border-stone-100 p-8 text-center hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-300">
              <div class="w-14 h-14 mx-auto mb-4 bg-white border border-stone-200 rounded-full flex items-center justify-center text-2xl group-hover:border-amber-300 group-hover:scale-110 transition-all duration-300">
                {{ cat.icon }}
              </div>
              <h3 class="text-sm font-semibold text-stone-800 tracking-wide group-hover:text-amber-800 transition-colors">{{ cat.name }}</h3>
              <p class="text-xs text-stone-400 mt-1">{{ cat.count }}+ designs</p>
            </a>
          }
        </div>
      </div>
    </section>

    <section class="py-20 bg-stone-50">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="flex items-end justify-between mb-10">
          <div>
            <p class="text-amber-700 text-xs font-semibold tracking-[0.2em] uppercase mb-3">New Arrivals</p>
            <h2 class="text-3xl font-bold text-stone-900 tracking-tight">Featured Pieces</h2>
          </div>
          <a routerLink="/catalog" class="text-sm font-medium text-stone-600 hover:text-amber-700 transition-colors">
            View all &rarr;
          </a>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          @for (product of featuredProducts(); track product.id) {
            <a [routerLink]="['/catalog', product.id]"
              class="group bg-white rounded-lg overflow-hidden border border-stone-100 hover:border-stone-200 hover:shadow-md transition-all duration-300">
              <div class="aspect-square bg-stone-100 relative overflow-hidden">
                @if (product.imageUrls.length > 0) {
                  <img [src]="product.imageUrls[0]" [alt]="product.name"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                } @else {
                  <div class="w-full h-full flex items-center justify-center">
                    <span class="text-5xl opacity-40">&#10022;</span>
                  </div>
                }
                @if (product.discountPercent > 0) {
                  <span class="absolute top-3 left-3 text-[11px] font-semibold bg-red-600 text-white px-2 py-0.5 rounded">
                    -{{ product.discountPercent }}%
                  </span>
                }
              </div>
              <div class="p-4">
                <p class="text-xs text-stone-400 uppercase tracking-wide">{{ product.metalType }}</p>
                <h3 class="text-sm font-semibold text-stone-900 mt-1 group-hover:text-amber-800 transition-colors">{{ product.name }}</h3>
                <div class="mt-2 flex items-baseline gap-2">
                  <span class="text-base font-bold text-stone-900">&#8377;{{ product.sellingPrice | number }}</span>
                  @if (product.discountPercent > 0) {
                    <span class="text-xs text-stone-400 line-through">&#8377;{{ product.basePrice | number }}</span>
                  }
                </div>
              </div>
            </a>
          }
        </div>
      </div>
    </section>

    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (feature of features; track feature.title) {
            <div class="text-center p-8">
              <div class="w-12 h-12 mx-auto mb-5 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
                <span class="text-xl">{{ feature.icon }}</span>
              </div>
              <h3 class="text-sm font-bold text-stone-900 uppercase tracking-wide">{{ feature.title }}</h3>
              <p class="text-sm text-stone-500 mt-2 leading-relaxed">{{ feature.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <section class="py-20 bg-stone-900">
      <div class="max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <p class="text-amber-500/80 text-xs font-semibold tracking-[0.2em] uppercase mb-4">Not sure what to pick?</p>
        <h2 class="text-3xl font-bold text-white tracking-tight mb-4">Let AI Find Your Perfect Piece</h2>
        <p class="text-stone-400 leading-relaxed mb-8">
          Describe your occasion, style, or budget — our AI stylist will curate recommendations just for you.
        </p>
        <a routerLink="/ai-assistant"
          class="inline-block px-7 py-3.5 bg-amber-600 text-white text-sm font-semibold tracking-wide hover:bg-amber-500 transition-all duration-200 rounded">
          Start a Conversation
        </a>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  featuredProducts = signal<Product[]>([]);

  categories = [
    { name: 'Rings', slug: 'rings', icon: '💍', count: 120 },
    { name: 'Earrings', slug: 'earrings', icon: '✨', count: 85 },
    { name: 'Necklaces', slug: 'necklaces', icon: '📿', count: 95 },
    { name: 'Bracelets', slug: 'bracelets', icon: '⌚', count: 60 }
  ];

  features = [
    { icon: '🤖', title: 'AI Recommendations', desc: 'Get personalized suggestions based on your style and occasion.' },
    { icon: '🎨', title: '3D Custom Design', desc: 'Configure your dream piece in our interactive 3D studio.' },
    { icon: '📜', title: 'Certified Authentic', desc: 'Every piece comes with a certificate of authenticity and purity.' }
  ];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getFeaturedProducts().subscribe({
      next: products => this.featuredProducts.set(products),
      error: () => {}
    });
  }
}
