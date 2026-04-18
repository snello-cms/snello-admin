import {Component, DestroyRef, ElementRef, ViewChild, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';
import {SnelloChatAction} from '../../models/snello-chat-action';
import {SnelloChatService} from '../../services/snello-chat.service';

type ChatRole = 'assistant' | 'user';

interface ChatMessage {
    id: number;
    role: ChatRole;
    text: string;
    time: string;
    actions?: SnelloChatAction[];
}

@Component({
    standalone: true,
    selector: 'snello-chat-widget',
    templateUrl: './snello-chat-widget.component.html',
    styleUrls: ['./snello-chat-widget.component.scss']
})
export class SnelloChatWidgetComponent {
    @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;

    private readonly router = inject(Router);
    private readonly chatService = inject(SnelloChatService);
    private readonly destroyRef = inject(DestroyRef);

    isOpen = false;
    draft = '';
    isSending = false;
    currentContext = this.describeContext(this.router.url);
    private nextId = 3;

    suggestions = this.getSuggestionsForUrl(this.router.url);

    messages: ChatMessage[] = [
        {
            id: 1,
            role: 'assistant',
            text: 'Hello, I am the Snello assistant. I can help you navigate the CMS and prepare data operations based on the page you are viewing.',
            time: this.currentTime()
        },
        {
            id: 2,
            role: 'assistant',
            text: 'Send me a request below. I will also use the current page context to help you better.',
            time: this.currentTime()
        }
    ];

    constructor() {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(() => {
            this.currentContext = this.describeContext(this.router.url);
            this.suggestions = this.getSuggestionsForUrl(this.router.url);
        });
    }

    toggleOpen(): void {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.scrollToBottom();
        }
    }

    openFromTail(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.isOpen = true;
        this.scrollToBottom();
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

        if (!value || this.isSending) {
            return;
        }

        this.pushMessage('user', value);
        this.draft = '';
        this.isSending = true;

        this.chatService.sendMessage({
            message: value,
            currentContext: this.currentContext
        }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: reply => {
                this.pushMessage('assistant', reply.text, reply.actions);
                this.isSending = false;
            },
            error: () => {
                this.pushMessage('assistant', 'Non sono riuscito a contattare il servizio AI in questo momento. Riprova tra poco.');
                this.isSending = false;
            }
        });
    }

    openAction(action: SnelloChatAction): void {
        if (action.type !== 'open') {
            return;
        }

        void this.router.navigate(['/datalist/view', action.entity, action.id]);
    }

    private pushMessage(role: ChatRole, text: string, actions?: SnelloChatAction[]): void {
        this.messages = [
            ...this.messages,
            {
                id: this.nextId++,
                role,
                text,
                time: this.currentTime(),
                actions
            }
        ];
        this.scrollToBottom();
    }

    private describeContext(url: string): string {
        if (url.includes('/metadata/')) {
            return 'Sezione metadati';
        }

        if (url.includes('/fielddefinition/')) {
            return 'Sezione field definitions';
        }

        if (url.includes('/datalist/list/')) {
            const entity = decodeURIComponent(url.split('/datalist/list/')[1] || '').replace(/\?.*$/, '');
            return entity ? `Lista dati di ${entity}` : 'Lista dati';
        }

        if (url.includes('/datalist/edit/')) {
            const parts = url.split('/datalist/edit/')[1]?.split('/') || [];
            return parts[0] ? `Modifica dati di ${decodeURIComponent(parts[0])}` : 'Modifica dati';
        }

        if (url.includes('/datalist/view/')) {
            const parts = url.split('/datalist/view/')[1]?.split('/') || [];
            return parts[0] ? `Dettaglio dati di ${decodeURIComponent(parts[0])}` : 'Dettaglio dati';
        }

        if (url.includes('/home')) {
            return 'Home contents';
        }

        if (url.includes('/adminpage')) {
            return 'Dashboard amministrazione';
        }

        return 'Applicazione Snello';
    }

    private getSuggestionsForUrl(url: string): string[] {
        if (url.includes('/metadata/')) {
            return [
                'Spiegami a cosa serve questa sezione',
                'Come esporto un metadata?',
                'Come importo un file di metadata?'
            ];
        }

        if (url.includes('/datalist/list/')) {
            return [
                'Riassumi cosa posso fare in questa lista',
                'Come filtro i record?',
                'Come creo un nuovo elemento?'
            ];
        }

        if (url.includes('/adminpage')) {
            return [
                'Quali aree amministrative sono disponibili?',
                'Dove gestisco i metadata?',
                'Come arrivo alle field definitions?'
            ];
        }

        return [
            'Dove trovo i metadata?',
            'Come navigo nei contents?',
            'Aiutami a capire questa pagina'
        ];
    }

    private scrollToBottom(): void {
        window.setTimeout(() => {
            const container = this.messagesContainer?.nativeElement;
            if (!container) {
                return;
            }

            container.scrollTop = container.scrollHeight;
        });
    }

    private currentTime(): string {
        return new Intl.DateTimeFormat('it-IT', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date());
    }
}
