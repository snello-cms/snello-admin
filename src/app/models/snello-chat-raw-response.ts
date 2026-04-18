export type RawChatResponse = string | {
    reply?: string;
    message?: string;
    content?: string;
    text?: string;
};