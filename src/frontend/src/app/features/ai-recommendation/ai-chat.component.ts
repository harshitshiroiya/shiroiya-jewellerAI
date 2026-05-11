import { Component, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  products?: any[];
  generatedImages?: string[];
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <header class="bg-white border-b px-6 py-4">
        <h1 class="text-2xl font-bold text-gray-900">AI Jewellery Assistant</h1>
        <p class="text-gray-500">Tell me what you're looking for and I'll help you find the perfect piece.</p>
      </header>

      <div class="flex-1 overflow-y-auto p-6 space-y-6" #chatContainer>
        @if (messages().length === 0) {
          <div class="text-center py-16">
            <div class="text-6xl mb-4">💎</div>
            <h2 class="text-xl font-semibold text-gray-700">How can I help you today?</h2>
            <p class="text-gray-500 mt-2 max-w-md mx-auto">Try asking something like:</p>
            <div class="mt-4 space-y-2">
              @for (suggestion of suggestions; track suggestion) {
                <button (click)="sendMessage(suggestion)"
                  class="block mx-auto px-4 py-2 bg-white border rounded-lg text-sm text-gray-700 hover:border-amber-500 hover:text-amber-600 transition">
                  "{{ suggestion }}"
                </button>
              }
            </div>
          </div>
        }

        @for (msg of messages(); track $index) {
          <div [class]="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
            <div [class]="msg.role === 'user' ? 'bg-amber-600 text-white' : 'bg-white border'" class="max-w-2xl rounded-2xl px-5 py-3 shadow-sm">
              <p class="whitespace-pre-wrap">{{ msg.content }}</p>

              @if (msg.products && msg.products.length > 0) {
                <div class="mt-4 grid grid-cols-2 gap-3">
                  @for (product of msg.products; track product.id) {
                    <a [routerLink]="['/catalog', product.id]" class="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition">
                      <p class="font-medium text-sm text-gray-900">{{ product.name }}</p>
                      <p class="text-xs text-gray-500">{{ product.metalType }} | {{ product.stoneType }}</p>
                      <p class="text-sm font-bold text-amber-600 mt-1">₹{{ product.sellingPrice }}</p>
                    </a>
                  }
                </div>
              }

              @if (msg.generatedImages && msg.generatedImages.length > 0) {
                <div class="mt-4 grid grid-cols-2 gap-2">
                  @for (img of msg.generatedImages; track img) {
                    <img [src]="img" class="rounded-lg w-full" alt="AI Generated Design" />
                  }
                </div>
              }
            </div>
          </div>
        }

        @if (loading()) {
          <div class="flex justify-start">
            <div class="bg-white border rounded-2xl px-5 py-3 shadow-sm">
              <div class="flex gap-1">
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></span>
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
              </div>
            </div>
          </div>
        }
      </div>

      <div class="bg-white border-t p-4">
        <form (ngSubmit)="sendMessage(userInput)" class="flex gap-3 max-w-4xl mx-auto">
          <input type="text" [(ngModel)]="userInput" name="message" placeholder="Describe what jewellery you're looking for..."
            class="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
          <button type="submit" [disabled]="loading() || !userInput.trim()"
            class="px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition disabled:opacity-50">
            Send
          </button>
        </form>
      </div>
    </div>
  `
})
export class AiChatComponent {
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  messages = signal<ChatMessage[]>([]);
  loading = signal(false);
  userInput = '';
  conversationId: string | null = null;

  suggestions = [
    'I want to gift my wife diamond earrings for our wedding anniversary',
    'Show me gold necklaces under ₹50,000',
    'I need an engagement ring with a round diamond',
    'Suggest something elegant in platinum for a birthday gift'
  ];

  constructor(private http: HttpClient) {}

  sendMessage(content: string) {
    if (!content.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content };
    this.messages.update(msgs => [...msgs, userMessage]);
    this.userInput = '';
    this.loading.set(true);

    const endpoint = this.conversationId
      ? `${environment.apiUrl}/ai/conversations/${this.conversationId}/messages`
      : `${environment.apiUrl}/ai/conversations`;

    this.http.post<any>(endpoint, { message: content }).subscribe({
      next: (response) => {
        this.conversationId = response.conversationId;
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.message,
          products: response.recommendedProducts,
          generatedImages: response.generatedImages
        };
        this.messages.update(msgs => [...msgs, assistantMessage]);
        this.loading.set(false);
        this.scrollToBottom();
      },
      error: () => {
        this.messages.update(msgs => [...msgs, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        this.loading.set(false);
      }
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
