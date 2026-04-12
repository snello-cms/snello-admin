import { Component } from '@angular/core';

type ChatRole = 'assistant' | 'user';

interface ChatMessage {
    id: number;
    role: ChatRole;
    text: string;
    time: string;
}

@Component({
    standalone: true,
    selector: 'snello-chat-widget',
    templateUrl: './snello-chat-widget.component.html',
    styleUrls: ['./snello-chat-widget.component.scss']
})
export class SnelloChatWidgetComponent {
    isOpen = false;
    draft = '';
    private nextId = 3;

    readonly suggestions = [
        'How do I find metadata?',
        'Where are the contents?',
        'Can you help me navigate?'
    ];

    messages: ChatMessage[] = [
        {
            id: 1,
            role: 'assistant',
            text: 'Hello! I am the Snello assistant. I can help you navigate metadata, content, and management tools.',
            time: this.currentTime()
        },
        {
            id: 2,
            role: 'assistant',
            text: 'Write below whenever you like: you can minimize me back to an icon at any time.',
            time: this.currentTime()
        }
    ];

    toggleOpen(): void {
        this.isOpen = !this.isOpen;
    }

    minimize(): void {
        this.isOpen = false;
    }

    updateDraft(event: Event): void {
        this.draft = (event.target as HTMLTextAreaElement).value ?? '';
    }

    submitFromKeyboard(event: KeyboardEvent): void {
        if (event.shiftKey) {
            return;
        }

        event.preventDefault();
        this.sendMessage();
    }

    useSuggestion(text: string): void {
        this.draft = text;
        this.sendMessage();
    }

    sendMessage(): void {
        const value = this.draft.trim();

        if (!value) {
            return;
        }

        this.pushMessage('user', value);
        this.draft = '';

        const reply = this.buildReply(value);
        window.setTimeout(() => this.pushMessage('assistant', reply), 280);
    }

    private pushMessage(role: ChatRole, text: string): void {
        this.messages = [
            ...this.messages,
            {
                id: this.nextId++,
                role,
                text,
                time: this.currentTime()
            }
        ];
    }

    private buildReply(question: string): string {
        const normalized = question.toLowerCase();

        if (normalized.includes('metadat')) {
            return 'You can use the magnifier in the sidebar to quickly filter metadata and open exactly what you need.';
        }

        if (normalized.includes('conten')) {
            return 'The CONTENTS section collects published metadata: from the side navigation you can open them quickly, also using search.';
        }

        if (normalized.includes('admin')) {
            return 'In the ADMIN tab you can find configuration, field definitions, documents, links, and all management features.';
        }

        if (normalized.includes('ciao') || normalized.includes('hello')) {
            return 'Hello 👋 Tell me what you want to reach in Snello and I will try to guide you.';
        }

        return 'For now this is an integrated chat UI ready to be connected to an AI service or a dedicated backend. In the meantime, I can offer quick navigation suggestions.';
    }

    private currentTime(): string {
        return new Intl.DateTimeFormat('it-IT', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date());
    }
}
