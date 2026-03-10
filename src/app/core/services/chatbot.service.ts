import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, tap, map } from 'rxjs';
import { ChatMessage, ChatbotResponse, ChatbotProduct } from '../models/chatbot.model';

@Injectable({
    providedIn: 'root',
})
export class ChatbotService {
    private api = inject(ApiService);

    chatHistory = signal<ChatMessage[]>([]);
    isLoading = signal<boolean>(false);
    conversationId = signal<string | null>(null);
    contextProducts = signal<ChatbotProduct[]>([]);

    sendMessage(message: string): Observable<ChatbotResponse> {

        this.chatHistory.update((history) => [...history, { role: 'user', content: message }]);
        this.isLoading.set(true);

        const body: any = { message };
        if (this.conversationId()) {
            body.conversationId = this.conversationId();
        }

        return this.api.post<ChatbotResponse>('chatbot/chat', body).pipe(
            tap({
                next: (response) => {
                    const data = response.data;

                    if (data?.conversationId) {
                        this.conversationId.set(data.conversationId);
                    }
                    if (data?.context?.products) {
                        this.contextProducts.set(data.context.products);
                    } else {
                        // Clear products if no new ones are provided
                        this.contextProducts.set([]);
                    }

                    this.chatHistory.update((history) => [
                        ...history,
                        {
                            role: 'model',
                            content: data?.response || 'No response',
                            isBot: true,
                            products: data?.context?.products
                        },
                    ]);
                    this.isLoading.set(false);
                },
                error: (err) => {
                    this.isLoading.set(false);
                    this.chatHistory.update((history) => [
                        ...history,
                        { role: 'model', content: 'Sorry, I encountered an error. Please try again later.', isBot: true },
                    ]);
                },
            })
        );
    }

    clearHistory() {
        this.chatHistory.set([]);
        this.conversationId.set(null);
        this.contextProducts.set([]);
    }
}
