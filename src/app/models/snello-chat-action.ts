export interface SnelloChatAction {
    type: 'open' | 'navigate' | 'create_preview';
    entity?: string;
    id?: string;
    label?: string;
    path?: string;
    payload?: Record<string, unknown>;
    keyField?: string;
}