import {SnelloChatAction} from './snello-chat-action';

export interface SnelloChatReply {
    text: string;
    html: string;
    actions: SnelloChatAction[];
}