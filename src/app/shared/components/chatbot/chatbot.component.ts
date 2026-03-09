import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../../core/services/chatbot.service';
import { ScrollToBottomDirective } from '../../directives/scroll-to-bottom.directive';
import { MarkdownModule } from 'ngx-markdown';

@Component({
    selector: 'app-chatbot',
    imports: [CommonModule, FormsModule, ScrollToBottomDirective, MarkdownModule],
    templateUrl: './chatbot.component.html',
    styleUrl: './chatbot.component.scss',
})
export class ChatbotComponent {
    chatService = inject(ChatbotService);

    isExpanded = signal<boolean>(false);
    userInput = '';
    newMessagesCount = signal<number>(0);

    suggestions = [
        'Track my last order',
        'Find laptops under 500',
        'Show my order history'
    ];

    isConfirmingClear = signal<boolean>(false);

    toggleChat() {
        this.isExpanded.update(v => !v);
        if (this.isExpanded()) {
            this.newMessagesCount.set(0);
        }
    }

    sendMessage() {
        if (!this.userInput.trim() || this.chatService.isLoading()) return;

        const message = this.userInput;
        this.userInput = '';

        this.chatService.sendMessage(message).subscribe();
    }

    sendQuickMessage(message: string) {
        this.userInput = message;
        this.sendMessage();
    }

    triggerClearHistory() {
        this.isConfirmingClear.set(true);
    }

    confirmClear() {
        this.chatService.clearHistory();
        this.isConfirmingClear.set(false);
    }

    cancelClear() {
        this.isConfirmingClear.set(false);
    }
}
