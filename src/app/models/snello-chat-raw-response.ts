import {SnelloChatAction} from './snello-chat-action';

export type RawChatResponse = string | {
    reply?: string;
    message?: string;
    content?: string;
    text?: string;
    response?: string;
    html?: string;
    actions?: SnelloChatAction[];
};