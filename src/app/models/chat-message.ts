import {SafeHtml} from '@angular/platform-browser';
import {SnelloChatAction} from './snello-chat-action';
import {ChatRole} from './chat-role';

export interface ChatMessage {
    id: number;
    role: ChatRole;
    text: string;
    html?: SafeHtml;
    time: string;
    actions?: SnelloChatAction[];
}
