import {Component, DestroyRef, ElementRef, SecurityContext, ViewChild, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NavigationEnd, Router} from '@angular/router';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {filter} from 'rxjs/operators';
import {SnelloChatAction} from '../../models/snello-chat-action';
import {SnelloChatService} from '../../services/snello-chat.service';

type ChatRole = 'assistant' | 'user';

interface ChatMessage {
    id: number;
    role: ChatRole;
    text: string;
    html?: SafeHtml;
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
    private readonly sanitizer = inject(DomSanitizer);

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
                this.pushMessage('assistant', reply.text, reply.actions, reply.html);
                this.isSending = false;
            },
            error: () => {
                this.pushMessage('assistant', 'Could not reach the AI service at this time. Please try again later.');
                this.isSending = false;
            }
        });
    }

    openAction(action: SnelloChatAction): void {
        if (action.type === 'open') {
            void this.router.navigate(['/datalist/view', action.entity, action.id]);
            this.isOpen = false;
            return;
        }

        if (action.type === 'navigate') {
            void this.router.navigate([action.entity]);
            this.isOpen = false;
        }
    }

    private pushMessage(role: ChatRole, text: string, actions?: SnelloChatAction[], rawHtml?: string): void {
        const html = rawHtml
            ? this.sanitizer.bypassSecurityTrustHtml(
                this.sanitizer.sanitize(SecurityContext.HTML, rawHtml) ?? text
              )
            : undefined;
        this.messages = [
            ...this.messages,
            {
                id: this.nextId++,
                role,
                text,
                html,
                time: this.currentTime(),
                actions
            }
        ];
        this.scrollToBottom();
    }

    private describeContext(url: string): string {
        if (url.includes('/metadata/list')) {
            return 'Metadata list';
        }

        if (url.includes('/metadata/edit/') || url.includes('/metadata/new')) {
            return 'Edit metadata';
        }

        if (url.includes('/metadata/')) {
            return 'Metadata section';
        }

        if (url.includes('/fielddefinition/list')) {
            return 'Field definitions list';
        }

        if (url.includes('/fielddefinition/edit/') || url.includes('/fielddefinition/new')) {
            return 'Edit field definition';
        }

        if (url.includes('/fielddefinition/')) {
            return 'Field definitions section';
        }

        if (url.includes('/datalist/list/')) {
            const entity = decodeURIComponent(url.split('/datalist/list/')[1] || '').replace(/\?.*$/, '');
            return entity ? `Data list: ${entity}` : 'Data list';
        }

        if (url.includes('/datalist/edit/')) {
            const parts = url.split('/datalist/edit/')[1]?.split('/') || [];
            return parts[0] ? `Edit record: ${decodeURIComponent(parts[0])}` : 'Edit record';
        }

        if (url.includes('/datalist/view/')) {
            const parts = url.split('/datalist/view/')[1]?.split('/') || [];
            return parts[0] ? `View record: ${decodeURIComponent(parts[0])}` : 'View record';
        }

        if (url.includes('/condition/')) {
            return 'Conditions section';
        }

        if (url.includes('/selectqueries/')) {
            return 'Select queries section';
        }

        if (url.includes('/document/')) {
            return 'Documents section';
        }

        if (url.includes('/images/')) {
            return 'Images section';
        }

        if (url.includes('/links/')) {
            return 'Links section';
        }

        if (url.includes('/massive/')) {
            return 'Massive modifications';
        }

        if (url.includes('/home')) {
            return 'Home';
        }

        if (url.includes('/adminpage')) {
            return 'Admin dashboard';
        }

        return 'Snello Admin';
    }

    private getSuggestionsForUrl(url: string): string[] {
        if (url.includes('/metadata/list')) {
            return [
                'List all available metadata tables',
                'How do I create a new metadata table?',
                'How do I export a metadata configuration?'
            ];
        }

        if (url.includes('/metadata/edit/') || url.includes('/metadata/new')) {
            return [
                'What fields are required for a metadata?',
                'How do I set an icon for this metadata?',
                'What is the "table name" used for?'
            ];
        }

        if (url.includes('/metadata/')) {
            return [
                'What can I do in the metadata section?',
                'How do I import a metadata file?',
                'How do I export this metadata?'
            ];
        }

        if (url.includes('/fielddefinition/list')) {
            return [
                'List all field definition types',
                'How do I create a join field?',
                'What is the difference between join and multijoin?'
            ];
        }

        if (url.includes('/fielddefinition/edit/') || url.includes('/fielddefinition/new')) {
            return [
                'What validation options are available?',
                'How do I set a default value?',
                'How do I make a field mandatory?'
            ];
        }

        if (url.includes('/fielddefinition/')) {
            return [
                'What field types are supported?',
                'How do I add a field to a metadata?',
                'What does "show in list" do?'
            ];
        }

        if (url.includes('/datalist/list/')) {
            const entity = decodeURIComponent(url.split('/datalist/list/')[1] || '').replace(/\?.*$/, '');
            return [
                `How do I filter records in ${entity}?`,
                `How do I create a new ${entity} record?`,
                `What fields does ${entity} have?`
            ];
        }

        if (url.includes('/datalist/edit/')) {
            const parts = url.split('/datalist/edit/')[1]?.split('/') || [];
            const entity = parts[0] ? decodeURIComponent(parts[0]) : 'this record';
            return [
                `What fields are mandatory in ${entity}?`,
                `How do I upload an image to ${entity}?`,
                `Can I duplicate this ${entity} record?`
            ];
        }

        if (url.includes('/datalist/view/')) {
            const parts = url.split('/datalist/view/')[1]?.split('/') || [];
            const entity = parts[0] ? decodeURIComponent(parts[0]) : 'this record';
            return [
                `How do I edit this ${entity} record?`,
                `What related data does ${entity} have?`,
                `How do I delete this ${entity} record?`
            ];
        }

        if (url.includes('/condition/')) {
            return [
                'What is a condition used for?',
                'How do I write a condition filter?',
                'How do I attach a condition to a metadata?'
            ];
        }

        if (url.includes('/selectqueries/')) {
            return [
                'How do I write a select query?',
                'How do I expose a query as an API endpoint?',
                'What parameters can I use in a query?'
            ];
        }

        if (url.includes('/document/')) {
            return [
                'How do I upload a new document?',
                'What file formats are supported?',
                'How do I link a document to a record?'
            ];
        }

        if (url.includes('/images/')) {
            return [
                'How do I upload a new image?',
                'What image formats are supported?',
                'How do I link an image to a metadata field?'
            ];
        }

        if (url.includes('/links/')) {
            return [
                'What is a URL mapping rule?',
                'How do I create a new link rule?',
                'How do I test a link mapping?'
            ];
        }

        if (url.includes('/massive/')) {
            return [
                'How does the bulk edit workflow work?',
                'How do I save all modified rows at once?',
                'How do I select which fields to edit in bulk?'
            ];
        }

        if (url.includes('/adminpage')) {
            return [
                'What areas can I manage from the dashboard?',
                'Where do I manage metadata tables?',
                'How do I get to the field definitions?'
            ];
        }

        if (url.includes('/home')) {
            return [
                'What can I do in Snello Admin?',
                'How do I navigate to my data?',
                'What is the difference between metadata and field definitions?'
            ];
        }

        return [
            'Where do I find metadata?',
            'How do I navigate my content?',
            'Help me understand this page'
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
