import { Component, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AIService, AIMessage } from '../../core/services/ai.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="h-[calc(100vh-4rem)] flex flex-col bg-stone-50">
      <header class="bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 class="text-lg font-bold text-stone-900 tracking-tight">AI Stylist</h1>
          <p class="text-xs text-stone-400 mt-0.5">Describe what you're looking for — occasion, style, budget</p>
        </div>
        <button (click)="aiService.startNewConversation()"
          class="text-xs font-medium px-3 py-1.5 border border-stone-200 rounded text-stone-600 hover:bg-stone-50 transition-colors">
          New chat
        </button>
      </header>

      <div class="flex-1 overflow-y-auto px-6 py-6 space-y-5" #chatContainer>
        @if (aiService.messages().length === 0) {
          <div class="flex flex-col items-center justify-center h-full text-center">
            <div class="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mb-5">
              <span class="text-2xl">&#10022;</span>
            </div>
            <h2 class="text-base font-semibold text-stone-800">How can I help you today?</h2>
            <p class="text-sm text-stone-400 mt-1 max-w-sm">I can recommend pieces, suggest designs, and help you find the perfect jewellery.</p>
            <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              @for (suggestion of suggestions; track suggestion) {
                <button (click)="sendMessage(suggestion)"
                  class="text-left px-4 py-3 bg-white border border-stone-150 rounded-lg text-sm text-stone-700 hover:border-amber-300 hover:bg-amber-50/30 transition-all duration-200">
                  {{ suggestion }}
                </button>
              }
            </div>
          </div>
        }

        @for (msg of aiService.messages(); track $index) {
          <div [class]="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
            <div [class]="msg.role === 'user'
              ? 'bg-stone-900 text-white rounded-2xl rounded-br-sm'
              : 'bg-white border border-stone-100 text-stone-800 rounded-2xl rounded-bl-sm'"
              class="max-w-xl px-4 py-3 shadow-sm">
              <p class="text-sm whitespace-pre-wrap leading-relaxed">{{ msg.content }}</p>

              @if (msg.products && msg.products.length > 0) {
                <div class="mt-3 grid grid-cols-2 gap-2">
                  @for (product of msg.products; track product.id) {
                    <div class="bg-stone-50 rounded-lg p-3 border border-stone-100">
                      <a [routerLink]="['/catalog', product.id]" class="block">
                        <p class="text-xs font-semibold text-stone-900">{{ product.name }}</p>
                        <p class="text-[11px] text-stone-400 mt-0.5">{{ product.metalType }} &middot; {{ product.stoneType }}</p>
                        <p class="text-sm font-bold text-stone-900 mt-1">&#8377;{{ product.sellingPrice | number }}</p>
                      </a>
                      <button (click)="addToCart(product.id)"
                        class="mt-2 text-[11px] font-semibold px-2.5 py-1 bg-stone-900 text-white rounded hover:bg-stone-800 transition-colors">
                        Add to cart
                      </button>
                    </div>
                  }
                </div>
              }

              @if (msg.imageUrl) {
                <div class="mt-3">
                  <img [src]="msg.imageUrl" class="rounded-lg w-full max-w-xs" alt="AI Generated Design" />
                  <p class="text-[11px] text-stone-400 mt-1">AI-generated design concept</p>
                </div>
              }
            </div>
          </div>
        }

        @if (aiService.isLoading()) {
          <div class="flex justify-start">
            <div class="bg-white border border-stone-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div class="flex gap-1.5">
                <span class="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce"></span>
                <span class="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" style="animation-delay: 0.15s"></span>
                <span class="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" style="animation-delay: 0.3s"></span>
              </div>
            </div>
          </div>
        }
      </div>

      <div class="bg-white border-t border-stone-100 p-4 shrink-0">
        <form (ngSubmit)="sendMessage(userInput)" class="flex gap-2 max-w-3xl mx-auto">
          <input type="text" [(ngModel)]="userInput" name="message"
            placeholder="Describe what you're looking for..."
            class="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition" />
          <button type="submit" [disabled]="aiService.isLoading() || !userInput.trim()"
            class="px-5 py-2.5 bg-stone-900 text-white rounded text-sm font-semibold hover:bg-stone-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Send
          </button>
        </form>
      </div>
    </div>
  `
})
export class AiChatComponent {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  userInput = '';

  suggestions = [
    'Diamond earrings for an anniversary',
    'Gold necklaces under ₹50,000',
    'Engagement ring with round diamond',
    'Elegant platinum birthday gift'
  ];

  constructor(
    public aiService: AIService,
    private cartService: CartService
  ) {}

  async sendMessage(content: string) {
    if (!content.trim()) return;
    this.userInput = '';
    await this.aiService.sendMessage(content);
    this.scrollToBottom();
  }

  addToCart(productId: string) {
    this.cartService.addItem(productId).subscribe();
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
