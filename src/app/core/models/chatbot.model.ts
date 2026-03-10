export interface ChatbotProduct {
    _id: string;
    name: string;
    price: number;
    stock: number;
    ratingsAverage: number;
    images: string[];
    category: { _id: string; name: string };
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
    toolCalls?: string[];
    tokenCount?: number;
    createdAt?: string;
    updatedAt?: string;
    isBot?: boolean;
    products?: ChatbotProduct[];
}

export interface ChatbotResponse {
    status: string;
    data: {
        conversationId: string;
        response: string;
        context?: {
            products?: ChatbotProduct[];
        };
        tokenUsage?: {
            promptTokens: number;
            completionTokens: number;
            total: number;
        };
    };
}



