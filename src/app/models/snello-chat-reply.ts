import {SnelloChatAction} from './snello-chat-action';

export interface SnelloChatReply {
    text: string;
    actions: SnelloChatAction[];
}