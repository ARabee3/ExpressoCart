export interface ChatMessage {
    role: 'user' | 'assistant';
    text: string;
    isBot?: boolean;
}
