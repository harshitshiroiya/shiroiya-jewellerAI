import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  products?: any[];
  imageUrl?: string;
}

export interface AIConversation {
  id: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class AIService {
  private readonly apiUrl = `${environment.apiUrl}/ai`;
  messages = signal<AIMessage[]>([]);
  isLoading = signal(false);
  currentConversationId = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  async sendMessage(message: string): Promise<void> {
    this.isLoading.set(true);
    this.messages.update(msgs => [...msgs, { role: 'user', content: message }]);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${this.apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message,
          conversationId: this.currentConversationId()
        })
      });

      if (!response.ok) {
        const errBody = await response.text();
        let errMsg = 'I apologize, but I\'m unable to connect right now. Please try again later.';
        try {
          const parsed = JSON.parse(errBody);
          if (parsed.message) errMsg = parsed.message;
        } catch {}
        this.messages.update(msgs => [...msgs, { role: 'assistant', content: errMsg }]);
        this.isLoading.set(false);
        return;
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream')) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let assistantMessage: AIMessage = { role: 'assistant', content: '' };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

          for (const line of lines) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              this.currentConversationId.set(parsed.conversationId);

              if (parsed.type === 'text') {
                assistantMessage.content = parsed.content;
              } else if (parsed.type === 'products') {
                assistantMessage.products = JSON.parse(parsed.content);
              } else if (parsed.type === 'image') {
                assistantMessage.imageUrl = parsed.content;
              }
            } catch {}
          }
        }

        this.messages.update(msgs => [...msgs, assistantMessage]);
      } else {
        const data = await response.json();
        const assistantMessage: AIMessage = {
          role: 'assistant',
          content: data.content || data.message || JSON.stringify(data),
          products: data.products,
          imageUrl: data.imageUrl
        };
        if (data.conversationId) this.currentConversationId.set(data.conversationId);
        this.messages.update(msgs => [...msgs, assistantMessage]);
      }
    } catch (err) {
      this.messages.update(msgs => [...msgs, {
        role: 'assistant',
        content: 'I apologize, the AI service is not available at the moment. Please ensure the Azure OpenAI service is configured and try again.'
      }]);
    }

    this.isLoading.set(false);
  }

  getConversations() {
    return this.http.get<AIConversation[]>(`${this.apiUrl}/conversations`);
  }

  startNewConversation() {
    this.messages.set([]);
    this.currentConversationId.set(null);
  }

  generateImage(description: string) {
    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/generate-image`, { description });
  }
}
