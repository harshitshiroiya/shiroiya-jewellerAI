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
    <div class="h-[calc(100vh-72px)] flex flex-col bg-champagne-50">
      <header class="bg-white border-b border-champagne-100 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 class="font-serif text-xl text-champagne-900 italic">AI Stylist</h1>
          <p class="text-xs text-champagne-500 mt-0.5">Your personal jewellery concierge</p>
        </div>
        <button (click)="aiService.startNewConversation()"
          class="text-xs font-medium px-4 py-2 border border-champagne-200 rounded-full text-champagne-700 hover:bg-champagne-50 transition-colors">
          New conversation
        </button>
      </header>

      <div class="flex-1 overflow-y-auto px-6 py-6 space-y-5" #chatContainer>
        @if (aiService.messages().length === 0) {
          <div class="flex flex-col items-center justify-center h-full text-center">
            <div class="w-16 h-16 rounded-full bg-champagne-100 flex items-center justify-center mb-5">
              <span class="font-serif text-2xl text-champagne-600 italic">S</span>
            </div>
            <h2 class="font-serif text-lg text-champagne-800 italic">How may I assist you today?</h2>
            <p class="text-sm text-champagne-500 mt-2 max-w-sm">Describe the occasion, your style, or what inspires you.</p>
            <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg w-full">
              @for (suggestion of suggestions; track suggestion) {
                <button (click)="sendMessage(suggestion)"
                  class="text-left px-4 py-3.5 bg-white border border-champagne-200 rounded-xl text-sm text-champagne-700 hover:border-champagne-400 hover:bg-champagne-50 transition-all duration-300">
                  {{ suggestion }}
                </button>
              }
            </div>
          </div>
        }

        @for (msg of aiService.messages(); track $index) {
          <div [class]="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
            <div [class]="msg.role === 'user'
              ? 'bg-champagne-900 text-champagne-50 rounded-2xl rounded-br-sm'
              : 'bg-white border border-champagne-100 text-champagne-800 rounded-2xl rounded-bl-sm'"
              class="max-w-xl px-5 py-3.5 shadow-sm">
              <p class="text-sm whitespace-pre-wrap leading-relaxed">{{ msg.content }}</p>

              @if (msg.products && msg.products.length > 0) {
                <div class="mt-3 grid grid-cols-2 gap-2">
                  @for (product of msg.products; track product.id) {
                    <div class="bg-champagne-50 rounded-xl p-3 border border-champagne-100">
                      <a [routerLink]="['/catalog', product.id]" class="block">
                        <p class="text-xs font-medium text-champagne-900">{{ product.name }}</p>
                        <p class="text-[11px] text-champagne-500 mt-0.5">{{ product.metalType }}</p>
                        <p class="text-sm font-semibold text-champagne-800 mt-1">&#8377;{{ product.sellingPrice | number }}</p>
                      </a>
                      <button (click)="addToCart(product.id)"
                        class="mt-2 text-[11px] font-medium px-3 py-1.5 bg-champagne-900 text-champagne-50 rounded-full hover:bg-champagne-800 transition-colors">
                        Add to cart
                      </button>
                    </div>
                  }
                </div>
              }

              @if (msg.imageUrl) {
                <div class="mt-3">
                  <img [src]="msg.imageUrl" class="rounded-xl w-full max-w-xs" alt="AI Generated Design" />
                  <p class="text-[11px] text-champagne-500 mt-1.5 italic">AI-generated concept</p>
                </div>
              }
            </div>
          </div>
        }

        @if (aiService.isLoading()) {
          <div class="flex justify-start">
            <div class="bg-white border border-champagne-100 rounded-2xl rounded-bl-sm px-5 py-3.5 shadow-sm">
              <div class="flex gap-1.5">
                <span class="w-2 h-2 bg-champagne-300 rounded-full animate-bounce"></span>
                <span class="w-2 h-2 bg-champagne-300 rounded-full animate-bounce" style="animation-delay: 0.15s"></span>
                <span class="w-2 h-2 bg-champagne-300 rounded-full animate-bounce" style="animation-delay: 0.3s"></span>
              </div>
            </div>
          </div>
        }
      </div>

      <div class="bg-white border-t border-champagne-100 p-4 shrink-0">
        <form (ngSubmit)="sendMessage(userInput)" class="flex gap-3 max-w-3xl mx-auto">
          <input type="text" [(ngModel)]="userInput" name="message"
            placeholder="Tell me about the piece you're imagining..."
            class="flex-1 px-5 py-3 bg-champagne-50/50 border border-champagne-200 rounded-full text-sm text-champagne-900 placeholder:text-champagne-400 focus:outline-none focus:ring-2 focus:ring-champagne-300 focus:border-champagne-400 transition" />
          <button type="submit" [disabled]="aiService.isLoading() || !userInput.trim()"
            class="px-6 py-3 bg-champagne-900 text-champagne-50 rounded-full text-sm font-medium hover:bg-champagne-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
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
    'Gold necklaces under 50,000',
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
