import { Component, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AIService, AIMessage } from '../../core/services/ai.service';
import { CartService } from '../../core/services/cart.service';
import { DesignTransferService, DesignConfig } from '../../core/services/design-transfer.service';

type ChatMode = 'design' | 'discover';

interface ChatMessage extends AIMessage {
  designConfig?: DesignConfig;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="h-[calc(100vh-72px)] flex flex-col bg-champagne-50">
      <!-- Header with mode toggle -->
      <header class="bg-white border-b border-champagne-100 px-6 py-4 shrink-0">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h1 class="font-serif text-xl text-champagne-900 italic">AI Stylist</h1>
            <p class="text-xs text-champagne-500 mt-0.5">Your personal jewellery concierge</p>
          </div>
          <button (click)="startNewConversation()"
            class="text-xs font-medium px-4 py-2 border border-champagne-200 rounded-full text-champagne-700 hover:bg-champagne-50 transition-colors">
            New conversation
          </button>
        </div>

        <!-- Mode Toggle -->
        <div class="flex bg-champagne-100/60 rounded-full p-1 max-w-xs">
          <button (click)="switchMode('design')"
            [class]="mode() === 'design'
              ? 'flex-1 px-4 py-2 text-xs font-semibold rounded-full bg-champagne-900 text-champagne-50 shadow-sm transition-all'
              : 'flex-1 px-4 py-2 text-xs font-medium rounded-full text-champagne-600 hover:text-champagne-800 transition-all'">
            Design
          </button>
          <button (click)="switchMode('discover')"
            [class]="mode() === 'discover'
              ? 'flex-1 px-4 py-2 text-xs font-semibold rounded-full bg-champagne-900 text-champagne-50 shadow-sm transition-all'
              : 'flex-1 px-4 py-2 text-xs font-medium rounded-full text-champagne-600 hover:text-champagne-800 transition-all'">
            Discover
          </button>
        </div>
      </header>

      <!-- Chat Messages -->
      <div class="flex-1 overflow-y-auto px-6 py-6 space-y-5" #chatContainer>
        @if (messages().length === 0) {
          <div class="flex flex-col items-center justify-center h-full text-center">
            <div class="w-16 h-16 rounded-full bg-champagne-100 flex items-center justify-center mb-5">
              <span class="font-serif text-2xl text-champagne-600 italic">S</span>
            </div>
            <h2 class="font-serif text-lg text-champagne-800 italic">
              {{ mode() === 'design' ? 'Describe your dream jewellery' : 'How may I assist you today?' }}
            </h2>
            <p class="text-sm text-champagne-500 mt-2 max-w-sm">
              {{ mode() === 'design'
                ? 'Tell me what you envision and I will prepare it in the Design Studio.'
                : 'Describe the occasion, your style, or what inspires you.' }}
            </p>
            <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg w-full">
              @for (suggestion of activeSuggestions(); track suggestion) {
                <button (click)="sendMessage(suggestion)"
                  class="text-left px-4 py-3.5 bg-white border border-champagne-200 rounded-xl text-sm text-champagne-700 hover:border-champagne-400 hover:bg-champagne-50 transition-all duration-300">
                  {{ suggestion }}
                </button>
              }
            </div>
          </div>
        }

        @for (msg of messages(); track $index) {
          <div [class]="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
            <div [class]="msg.role === 'user'
              ? 'bg-champagne-900 text-champagne-50 rounded-2xl rounded-br-sm'
              : 'bg-white border border-champagne-100 text-champagne-800 rounded-2xl rounded-bl-sm'"
              class="max-w-xl px-5 py-3.5 shadow-sm">
              <p class="text-sm whitespace-pre-wrap leading-relaxed">{{ msg.content }}</p>

              <!-- Design Mode: Open in Design Studio button -->
              @if (msg.designConfig && msg.role === 'assistant') {
                <div class="mt-4">
                  <div class="bg-champagne-50 border border-champagne-200 rounded-xl p-3 mb-3">
                    <p class="text-[11px] font-medium text-champagne-600 uppercase tracking-wide mb-1">Detected Design</p>
                    <p class="text-xs text-champagne-800">
                      {{ msg.designConfig.metalType }} {{ msg.designConfig.jewelleryType }}
                      @if (msg.designConfig.elements.length > 1) {
                        with {{ msg.designConfig.elements.length - 1 }} stone element(s)
                      }
                    </p>
                  </div>
                  <button (click)="openInDesignStudio(msg.designConfig)"
                    class="w-full py-2.5 bg-champagne-900 text-champagne-50 rounded-xl text-sm font-semibold hover:bg-champagne-800 transition-colors flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Open in Design Studio
                  </button>
                </div>
              }

              <!-- Discover Mode: Product cards -->
              @if (msg.products && msg.products.length > 0) {
                <div class="mt-3 grid grid-cols-2 gap-2">
                  @for (product of msg.products; track product.id) {
                    @if (product.id) {
                      <div class="bg-champagne-50 rounded-xl p-3 border border-champagne-100">
                        <a [routerLink]="['/catalog', product.id]" class="block">
                          @if (product.imageUrls?.length) {
                            <img [src]="product.imageUrls[0]" [alt]="product.name"
                              class="w-full h-20 object-cover rounded-lg mb-2" />
                          }
                          <p class="text-xs font-medium text-champagne-900 line-clamp-2">{{ product.name }}</p>
                          <p class="text-[11px] text-champagne-500 mt-0.5">{{ product.metalType }}</p>
                          <p class="text-sm font-semibold text-champagne-800 mt-1">&#8377;{{ product.sellingPrice | number }}</p>
                        </a>
                        <div class="mt-2 flex items-center gap-1">
                          <button (click)="addToCart(product.id)"
                            [disabled]="addedToCartId() === product.id"
                            class="flex-1 text-[11px] font-medium px-3 py-1.5 bg-champagne-900 text-champagne-50 rounded-full hover:bg-champagne-800 transition-colors disabled:bg-green-600 disabled:cursor-default">
                            {{ addedToCartId() === product.id ? 'Added!' : 'Add to Cart' }}
                          </button>
                          <a [routerLink]="['/catalog', product.id]"
                            class="text-[11px] font-medium px-2 py-1.5 border border-champagne-200 text-champagne-700 rounded-full hover:bg-champagne-100 transition-colors">
                            View
                          </a>
                        </div>
                      </div>
                    }
                  }
                </div>
              }

              <!-- Image display -->
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

      <!-- Input Area -->
      <div class="bg-white border-t border-champagne-100 p-4 shrink-0">
        <form (ngSubmit)="sendMessage(userInput)" class="flex gap-3 max-w-3xl mx-auto">
          <input type="text" [(ngModel)]="userInput" name="message"
            [placeholder]="mode() === 'design'
              ? 'Describe your jewellery design...'
              : 'Tell me about the piece you are looking for...'"
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

  mode = signal<ChatMode>('discover');
  messages = signal<ChatMessage[]>([]);
  addedToCartId = signal<string | null>(null);

  private designSuggestions = [
    'Gold ring with 3 round diamonds',
    'Rose gold necklace with emerald drops',
    'Platinum earrings with pear-shaped sapphires',
    'White gold bangle with oval rubies'
  ];

  private discoverSuggestions = [
    'Diamond earrings for an anniversary',
    'Gold necklaces under 50,000',
    'Engagement ring with round diamond',
    'Elegant platinum birthday gift'
  ];

  activeSuggestions = signal<string[]>(this.discoverSuggestions);

  constructor(
    public aiService: AIService,
    private cartService: CartService,
    private designTransferService: DesignTransferService,
    private router: Router
  ) {}

  switchMode(newMode: ChatMode) {
    this.mode.set(newMode);
    this.activeSuggestions.set(
      newMode === 'design' ? this.designSuggestions : this.discoverSuggestions
    );
  }

  startNewConversation() {
    this.aiService.startNewConversation();
    this.messages.set([]);
  }

  async sendMessage(content: string) {
    if (!content.trim()) return;
    this.userInput = '';

    if (this.mode() === 'design') {
      await this.handleDesignMessage(content);
    } else {
      await this.handleDiscoverMessage(content);
    }
    this.scrollToBottom();
  }

  private async handleDesignMessage(content: string) {
    // Add user message
    this.messages.update(msgs => [...msgs, { role: 'user', content }]);

    // Parse the prompt into a design config
    const config = this.designTransferService.parsePrompt(content);

    // Build a response description
    const description = this.buildDesignDescription(config);

    // Add assistant message with design config
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: description,
      designConfig: config
    };
    this.messages.update(msgs => [...msgs, assistantMessage]);
  }

  private async handleDiscoverMessage(content: string) {
    // Add user message to local state
    this.messages.update(msgs => [...msgs, { role: 'user', content }]);

    // Send to AI service
    await this.aiService.sendMessage(content);

    // Get the latest assistant message from AI service and add to our messages
    const aiMessages = this.aiService.messages();
    const lastAiMsg = aiMessages[aiMessages.length - 1];
    if (lastAiMsg && lastAiMsg.role === 'assistant') {
      this.messages.update(msgs => [...msgs, lastAiMsg as ChatMessage]);
    }
  }

  openInDesignStudio(config: DesignConfig) {
    this.designTransferService.designConfig.set(config);
    const encoded = this.designTransferService.encodeConfig(config);
    this.router.navigate(['/custom-design'], {
      queryParams: { design: encoded }
    });
  }

  addToCart(productId: string) {
    if (!productId) return;
    this.cartService.addItem(productId).subscribe({
      next: () => {
        this.addedToCartId.set(productId);
        setTimeout(() => this.addedToCartId.set(null), 2000);
      },
      error: () => {
        // Silently fail; cart service handles its own state
      }
    });
  }

  private buildDesignDescription(config: DesignConfig): string {
    const parts: string[] = [];
    parts.push(`I have interpreted your design as a ${config.metalType} ${config.jewelleryType}.`);

    const stones = config.elements.filter(e => e.category === 'stone');
    if (stones.length > 0) {
      const stoneDescriptions = stones.map(s => {
        const shapeName = s.id.replace('-stone', '').replace('-', ' ');
        return `${s.count} ${shapeName} stone${(s.count || 1) > 1 ? 's' : ''}`;
      });
      parts.push(`It includes ${stoneDescriptions.join(', ')}.`);
    }

    parts.push('\nClick the button below to open this design in the Design Studio where you can customize placement, sizing, and materials.');

    return parts.join(' ');
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
