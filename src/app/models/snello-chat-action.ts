export interface SnelloChatAction {
    type: 'open' | 'navigate';
    entity: string;
    id: string;
    label?: string;
}