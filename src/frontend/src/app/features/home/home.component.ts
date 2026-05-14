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
    <section class="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-champagne-100 via-champagne-50 to-white">
      <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-champagne-200/40 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4"></div>
      <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-champagne-300/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>

      <div class="relative max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <div class="max-w-2xl">
          <p class="text-champagne-600 text-[11px] font-semibold tracking-[0.3em] uppercase mb-5">Intelligent Luxury</p>
          <h1 class="font-serif text-5xl lg:text-7xl font-light text-champagne-900 leading-[1.1] tracking-tight">
            Jewellery That<br/>
            <span class="italic font-medium">Understands</span> You
          </h1>
          <p class="text-lg text-champagne-700/70 mt-7 leading-relaxed max-w-lg font-light">
            Experience the harmony of AI precision and artisan mastery. Each piece is curated to your story, designed in 3D, and handcrafted with devotion.
          </p>
          <div class="flex flex-wrap gap-4 mt-10">
            <a routerLink="/ai-assistant"
              class="px-8 py-4 bg-champagne-900 text-champagne-50 text-sm font-medium tracking-wide hover:bg-champagne-800 transition-all duration-300 rounded-full">
              Speak to Our AI Stylist
            </a>
            <a routerLink="/catalog"
              class="px-8 py-4 border border-champagne-400 text-champagne-800 text-sm font-medium tracking-wide hover:border-champagne-600 hover:bg-champagne-100/50 transition-all duration-300 rounded-full">
              Explore Collection
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center mb-16">
          <p class="text-champagne-500 text-[11px] font-semibold tracking-[0.3em] uppercase mb-3">Categories</p>
          <h2 class="font-serif text-4xl font-light text-champagne-900 italic">Find Your Expression</h2>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          @for (cat of categories; track cat.slug) {
            <a [routerLink]="['/catalog']" [queryParams]="{category: cat.slug}"
              class="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-champagne-50 to-champagne-100/50 border border-champagne-200/60 p-10 text-center hover:border-champagne-400 hover:shadow-lg hover:shadow-champagne-200/40 transition-all duration-500">
              <div class="w-16 h-16 mx-auto mb-5 bg-white/80 border border-champagne-200 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-champagne-100 transition-all duration-500 shadow-sm">
                {{ cat.icon }}
              </div>
              <h3 class="font-serif text-lg text-champagne-900 group-hover:text-champagne-700 transition-colors">{{ cat.name }}</h3>
              <p class="text-xs text-champagne-500 mt-1 tracking-wide">{{ cat.count }}+ designs</p>
            </a>
          }
        </div>
      </div>
    </section>

    <section class="py-24 bg-champagne-50">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="flex items-end justify-between mb-12">
          <div>
            <p class="text-champagne-500 text-[11px] font-semibold tracking-[0.3em] uppercase mb-3">New Arrivals</p>
            <h2 class="font-serif text-4xl font-light text-champagne-900 italic">Featured Pieces</h2>
          </div>
          <a routerLink="/catalog" class="text-sm font-medium text-champagne-600 hover:text-champagne-800 transition-colors tracking-wide">
            View All &rarr;
          </a>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (product of featuredProducts(); track product.id) {
            <a [routerLink]="['/catalog', product.id]"
              class="group bg-white rounded-2xl overflow-hidden border border-champagne-100 hover:border-champagne-300 hover:shadow-xl hover:shadow-champagne-200/30 transition-all duration-500">
              <div class="aspect-[4/5] bg-gradient-to-b from-champagne-100 to-champagne-50 relative overflow-hidden">
                @if (product.imageUrls.length > 0) {
                  <img [src]="product.imageUrls[0]" [alt]="product.name"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                } @else {
                  <div class="w-full h-full flex items-center justify-center">
                    <span class="font-serif text-6xl text-champagne-300 italic">S</span>
                  </div>
                }
                @if (product.discountPercent > 0) {
                  <span class="absolute top-4 left-4 text-[10px] font-semibold bg-champagne-900 text-champagne-50 px-2.5 py-1 rounded-full">
                    -{{ product.discountPercent }}%
                  </span>
                }
              </div>
              <div class="p-5">
                <p class="text-[10px] text-champagne-500 uppercase tracking-[0.2em]">{{ product.metalType }}</p>
                <h3 class="font-serif text-base text-champagne-900 mt-1.5 group-hover:text-champagne-700 transition-colors">{{ product.name }}</h3>
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
      </div>
    </section>

    <section class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-1">
          @for (feature of features; track feature.title) {
            <div class="text-center p-12 border-r border-champagne-100 last:border-0">
              <div class="w-14 h-14 mx-auto mb-6 rounded-full bg-champagne-100 flex items-center justify-center">
                <span class="text-xl">{{ feature.icon }}</span>
              </div>
              <h3 class="font-serif text-lg text-champagne-900">{{ feature.title }}</h3>
              <p class="text-sm text-champagne-600/70 mt-2 leading-relaxed max-w-xs mx-auto">{{ feature.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <section class="py-24 bg-gradient-to-br from-champagne-900 via-champagne-800 to-champagne-900">
      <div class="max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <p class="text-champagne-400 text-[11px] font-semibold tracking-[0.3em] uppercase mb-5">Personal Concierge</p>
        <h2 class="font-serif text-4xl font-light text-champagne-50 italic leading-tight">Let AI Discover Your<br/>Perfect Piece</h2>
        <p class="text-champagne-300/70 leading-relaxed mt-5 max-w-lg mx-auto">
          Share your occasion, mood, or inspiration &mdash; our AI stylist will curate a selection as unique as you.
        </p>
        <a routerLink="/ai-assistant"
          class="inline-block mt-9 px-9 py-4 bg-champagne-50 text-champagne-900 text-sm font-medium tracking-wide hover:bg-white transition-all duration-300 rounded-full">
          Begin Consultation
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
    { icon: '🤖', title: 'AI Curation', desc: 'Intelligent recommendations tailored to your taste, occasion, and sentiment.' },
    { icon: '🎨', title: 'Bespoke Atelier', desc: 'Design your dream piece in our immersive 3D configurator.' },
    { icon: '📜', title: 'Certified Provenance', desc: 'Every gem comes with a certificate of authenticity and ethical sourcing.' }
  ];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getFeaturedProducts().subscribe({
      next: products => this.featuredProducts.set(products),
      error: () => {}
    });
  }
}
