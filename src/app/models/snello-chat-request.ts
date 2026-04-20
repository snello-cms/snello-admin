export interface SnelloChatRequest {
    message: string;
    currentContext?: string;
    language?: string;
    conversationId?: string;
}