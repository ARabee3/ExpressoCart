import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, tap } from 'rxjs';
import { ChatMessage } from '../models/chatbot.model';

@Injectable({
    providedIn: 'root',
})
export class ChatbotService {
    private api = inject(ApiService);
    
    chatHistory = signal<ChatMessage[]>([]);
    isLoading = signal<boolean>(false);

    sendMessage(message: string): Observable<any> {
        const currentHistory = this.chatHistory();

        this.chatHistory.update((history) => [...history, { role: 'user', text: message }]);

        this.isLoading.set(true);

        const historyForBackend = currentHistory.map((m) => ({
            role: m.role,
            text: m.text,
        }));

        return this.api.post<any>('chat', { message, history: historyForBackend }).pipe(
            tap({
                next: (response) => {
                    this.chatHistory.update((history) => [
                        ...history,
                        { role: 'assistant', text: response.reply || response.text || 'No response' },
                    ]);
                    this.isLoading.set(false);
                },
                error: () => {
                    this.isLoading.set(false);
                    this.chatHistory.update((history) => [
                        ...history,
                        { role: 'assistant', text: 'Sorry, I encountered an error. Please try again.' },
                    ]);
                },
            })
        );
    }

    clearHistory() {
        this.chatHistory.set([]);
    }
}
