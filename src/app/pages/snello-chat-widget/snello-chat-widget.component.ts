import {AfterViewInit, ChangeDetectorRef, Component, DestroyRef, ElementRef, HostBinding, OnDestroy, SecurityContext, ViewChild, inject} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NavigationEnd, Router} from '@angular/router';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {of} from 'rxjs';
import {catchError, filter, map, switchMap, take} from 'rxjs/operators';
import {SnelloChatAction} from '../../models/snello-chat-action';
import {ChatRole} from '../../models/chat-role';
import {ChatMessage} from '../../models/chat-message';
import {SnelloChatService} from '../../services/snello-chat.service';
import {ApiService} from '../../services/api.service';
import {MetadataService} from '../../services/metadata.service';
import {AuthenticationService} from '../../services/authentication.service';

@Component({
    standalone: true,
    selector: 'snello-chat-widget',
    templateUrl: './snello-chat-widget.component.html',
    styleUrls: ['./snello-chat-widget.component.scss']
})
export class SnelloChatWidgetComponent implements AfterViewInit, OnDestroy {
    @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;
    @ViewChild('chatBodyContainer') private chatBodyContainer?: ElementRef<HTMLDivElement>;

    private readonly router = inject(Router);
    private readonly document = inject(DOCUMENT);
    private readonly chatService = inject(SnelloChatService);
    private readonly apiService = inject(ApiService);
    private readonly metadataService = inject(MetadataService);
    private readonly authService = inject(AuthenticationService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly sanitizer = inject(DomSanitizer);
    private readonly cdr = inject(ChangeDetectorRef);
    private messagesObserver?: MutationObserver;

    isOpen = false;
    isMaximized = false;
    @HostBinding('class.maximized') get hostMaximizedClass(): boolean {
        return this.isOpen && this.isMaximized;
    }
    draft = '';
    isSending = false;
    isCreatingRecord = false;
    pendingCreateAction?: SnelloChatAction;
    currentContext = this.describeContext(this.router.url);
    private inputHistory: string[] = [];
    private historyIndex = -1;
    private historyDraftSnapshot = '';
    private nextId = 3;
    private conversationId = crypto.randomUUID();

    suggestions = this.getSuggestionsForUrl(this.router.url);

    messages: ChatMessage[] = [
        {
            id: 1,
            role: 'assistant',
            text: this.buildGreeting(),
            time: this.currentTime()
        }
    ];

    constructor() {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((event) => {
            const nav = event as NavigationEnd;
            this.currentContext = this.describeContext(nav.urlAfterRedirects);
            this.suggestions = this.getSuggestionsForUrl(nav.urlAfterRedirects);

            // Reset chat on new session (user navigates to home after logout/login)
            if (nav.urlAfterRedirects === '/home' || nav.urlAfterRedirects === '/') {
                this.resetChat();
            }
        });
    }

    ngAfterViewInit(): void {
        this.observeMessageContainer();
    }

    ngOnDestroy(): void {
        this.messagesObserver?.disconnect();
        this.syncDockedBodyClass();
    }

    toggleOpen(): void {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            window.setTimeout(() => this.observeMessageContainer());
            this.scrollToBottom(true);
        } else {
            this.messagesObserver?.disconnect();
            this.isMaximized = false;
            this.syncDockedBodyClass();
        }
    }

    openFromTail(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.isOpen = true;
        window.setTimeout(() => this.observeMessageContainer());
        this.scrollToBottom(true);
    }

    minimize(): void {
        this.isOpen = false;
        this.isMaximized = false;
        this.syncDockedBodyClass();
        this.messagesObserver?.disconnect();
    }

    toggleMaximize(): void {
        this.isMaximized = !this.isMaximized;
        this.isOpen = true;
        this.syncDockedBodyClass();
        window.setTimeout(() => this.observeMessageContainer());
        this.scrollToBottom(true);
    }

    updateDraft(event: Event): void {
        this.draft = (event.target as HTMLTextAreaElement).value ?? '';
        if (this.historyIndex !== -1) {
            this.historyIndex = -1;
            this.historyDraftSnapshot = '';
        }
    }

    submitFromKeyboard(event: KeyboardEvent): void {
        if (event.shiftKey) {
            return;
        }

        event.preventDefault();
        this.sendMessage();
    }

    handleDraftHistoryNavigation(event: KeyboardEvent): void {
        if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
            return;
        }

        const target = event.target as HTMLTextAreaElement | null;
        if (!target) {
            return;
        }

        if (event.key === 'ArrowUp') {
            const isCursorAtStart = target.selectionStart === 0 && target.selectionEnd === 0;
            if (!isCursorAtStart) {
                return;
            }

            const changed = this.navigateHistory(-1);
            if (changed) {
                event.preventDefault();
            }
            return;
        }

        if (event.key === 'ArrowDown') {
            const valueLength = target.value.length;
            const isCursorAtEnd = target.selectionStart === valueLength && target.selectionEnd === valueLength;
            if (!isCursorAtEnd) {
                return;
            }

            const changed = this.navigateHistory(1);
            if (changed) {
                event.preventDefault();
            }
        }
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
        this.pushInputHistory(value);
        this.draft = '';
        this.isSending = true;
        this.scrollToBottom();

        this.chatService.sendMessage({
            message: value,
            currentContext: this.currentContext,
            conversationId: this.conversationId
        }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: reply => {
                this.pushMessage('assistant', reply.text, reply.actions, reply.html);
                this.pendingCreateAction = reply.actions?.find(action => action.type === 'create_preview');
                this.isSending = false;
                this.scrollToBottom();
            },
            error: () => {
                this.pushMessage('assistant', 'Could not reach the AI service at this time. Please try again later.');
                this.isSending = false;
                this.scrollToBottom();
            }
        });
    }

    openAction(action: SnelloChatAction): void {
        if (action.type === 'create_preview') {
            this.pendingCreateAction = action;
            this.scrollToBottom();
            return;
        }

        if (action.type === 'open') {
            if (!action.entity || !action.id) {
                return;
            }
            this.router.navigate(['/datalist/view', action.entity, action.id])
                .then(() => { this.isOpen = false; this.isMaximized = false; this.syncDockedBodyClass(); })
                .catch(() => { this.isOpen = false; this.isMaximized = false; this.syncDockedBodyClass(); });
            return;
        }

        if (action.type === 'navigate') {
            const path = action.path || action.entity;
            if (!path) {
                return;
            }
            const navigation = path.startsWith('/')
                ? this.router.navigateByUrl(path)
                : this.router.navigate([path]);
            navigation
                .then(() => { this.isOpen = false; this.isMaximized = false; this.syncDockedBodyClass(); })
                .catch(() => { this.isOpen = false; this.isMaximized = false; this.syncDockedBodyClass(); });
        }
    }

    cancelCreatePreview(): void {
        this.pendingCreateAction = undefined;
        this.scrollToBottom();
    }

    confirmCreatePreview(): void {
        if (!this.pendingCreateAction || !this.pendingCreateAction.entity || !this.pendingCreateAction.payload || this.isCreatingRecord) {
            return;
        }

        const action = this.pendingCreateAction;
        this.pushMessage('user', `I confirm the creation of the record in ${action.entity}.`);
        this.isCreatingRecord = true;

        this.apiService.persist(action.entity!, action.payload)
            .pipe(
                switchMap(createdRecord => {
                    const idFromPayload = this.resolveCreatedRecordId(createdRecord, action.keyField);
                    if (idFromPayload) {
                        return of({ createdRecord, recordId: idFromPayload });
                    }
                    return this.resolveMetadataKeyField(action.entity!).pipe(
                        map(keyField => ({
                            createdRecord,
                            recordId: this.resolveCreatedRecordId(createdRecord, keyField)
                        }))
                    );
                }),
                take(1),
                catchError(() => {
                    this.pushMessage('assistant', 'The record was not saved. Review the summary and try again.');
                    this.isCreatingRecord = false;
                    return of({ createdRecord: undefined, recordId: undefined });
                })
            )
            .subscribe(result => {
                if (!result.createdRecord) {
                    return;
                }

                this.pendingCreateAction = undefined;
                this.isCreatingRecord = false;

                if (result.recordId) {
                    const recordId = String(result.recordId);
                    this.pushMessage(
                        'assistant',
                        `Record created successfully. I opened the single-record view (${recordId}).`,
                        [{ type: 'open', entity: action.entity, id: recordId, label: 'Open created record' }]
                    );

                    this.router.navigate(['/datalist/view', action.entity, recordId]).catch(() => undefined);
                    return;
                }

                this.pushMessage('assistant', 'Record created successfully, but I could not determine the key to open the view automatically.');
            });
    }

    formatActionLabel(action: SnelloChatAction): string {
        if (action.label) {
            return action.label;
        }
        if (action.type === 'create_preview' && action.entity) {
            return `Create summary ${action.entity}`;
        }
        if (action.type === 'navigate') {
            return action.path || action.entity || 'Navigate';
        }
        if (action.type === 'open') {
            const entity = action.entity || 'record';
            const id = action.id || '';
            return id ? `${entity} #${id}` : entity;
        }
        return 'Action';
    }

    previewEntries(action?: SnelloChatAction): Array<{ key: string; value: string }> {
        if (!action?.payload) {
            return [];
        }

        return Object.keys(action.payload).map(key => ({
            key,
            value: this.stringifyPreviewValue(action.payload?.[key])
        }));
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

    private stringifyPreviewValue(value: unknown): string {
        if (value == null) {
            return '';
        }
        if (Array.isArray(value)) {
            return value.map(item => this.stringifyPreviewValue(item)).join(', ');
        }
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    }

    private resolveCreatedRecordId(record: unknown, keyField?: string): string | number | undefined {
        if (!record || typeof record !== 'object') {
            return undefined;
        }

        const row = record as Record<string, unknown>;
        if (keyField && row[keyField] != null) {
            return row[keyField] as string | number;
        }

        const fallbackKeys = ['uuid', 'id', 'ID'];
        for (const key of fallbackKeys) {
            if (row[key] != null) {
                return row[key] as string | number;
            }
        }

        return undefined;
    }

    private resolveMetadataKeyField(entity: string) {
        const cached = this.metadataService.getMetadataFromName(entity)?.table_key;
        if (cached) {
            return of(cached);
        }

        this.metadataService.buildSearch();
        this.metadataService.search.table_name = entity;
        delete this.metadataService.search.uuid;
        return this.metadataService.getList().pipe(
            map(metadata => metadata?.[0]?.table_key),
            catchError(() => of(undefined))
        );
    }

    private observeMessageContainer(): void {
        if (!this.messagesContainer?.nativeElement) {
            return;
        }

        this.messagesObserver?.disconnect();
        this.messagesObserver = new MutationObserver(() => {
            this.scrollToBottom();
        });
        this.messagesObserver.observe(this.messagesContainer.nativeElement, {
            childList: true,
            subtree: true,
            characterData: true
        });
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

    private resetChat(): void {
        this.nextId = 2;
        this.conversationId = crypto.randomUUID();
        this.messages = [
            {
                id: 1,
                role: 'assistant',
                text: this.buildGreeting(),
                time: this.currentTime()
            }
        ];
        this.draft = '';
        this.inputHistory = [];
        this.historyIndex = -1;
        this.historyDraftSnapshot = '';
        this.isSending = false;
        this.isMaximized = false;
        this.syncDockedBodyClass();
        this.isCreatingRecord = false;
        this.pendingCreateAction = undefined;
    }

    private navigateHistory(direction: -1 | 1): boolean {
        if (!this.inputHistory.length) {
            return false;
        }

        if (direction === -1) {
            if (this.historyIndex === -1) {
                this.historyDraftSnapshot = this.draft;
                this.historyIndex = this.inputHistory.length - 1;
                this.draft = this.inputHistory[this.historyIndex];
                return true;
            }

            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.draft = this.inputHistory[this.historyIndex];
                return true;
            }

            return false;
        }

        if (this.historyIndex === -1) {
            return false;
        }

        if (this.historyIndex < this.inputHistory.length - 1) {
            this.historyIndex++;
            this.draft = this.inputHistory[this.historyIndex];
            return true;
        }

        this.historyIndex = -1;
        this.draft = this.historyDraftSnapshot;
        this.historyDraftSnapshot = '';
        return true;
    }

    private pushInputHistory(value: string): void {
        const latest = this.inputHistory[this.inputHistory.length - 1];
        if (latest !== value) {
            this.inputHistory.push(value);
        }
        this.historyIndex = -1;
        this.historyDraftSnapshot = '';
    }

    private buildGreeting(): string {
        const profile = this.authService.userDetails;
        const name = profile?.firstName
            || this.authService.utente?.name
            || this.authService.utente?.username
            || '';
        return name
            ? `Hello ${name}, what can I do for you?`
            : `Hello, what can I do for you?`;
    }

    private syncDockedBodyClass(): void {
        this.document?.body?.classList.toggle('snello-chat-docked', this.isOpen && this.isMaximized);
    }

    private isNearBottom(): boolean {
        const scrollable = this.chatBodyContainer?.nativeElement;
        if (!scrollable) {
            return true;
        }
        const distanceFromBottom = scrollable.scrollHeight - scrollable.scrollTop - scrollable.clientHeight;
        return distanceFromBottom < 80;
    }

    private scrollToBottom(force = false): void {
        if (!force && !this.isNearBottom()) {
            return;
        }
        this.cdr.detectChanges();
        const run = () => {
            const scrollable = this.chatBodyContainer?.nativeElement;
            if (scrollable) {
                scrollable.scrollTop = scrollable.scrollHeight;
            }
            // Fallback in case the messages container becomes the scroll source.
            const messages = this.messagesContainer?.nativeElement;
            if (messages) {
                messages.scrollTop = messages.scrollHeight;
            }
        };
        run();
        requestAnimationFrame(run);
        requestAnimationFrame(() => requestAnimationFrame(run));
        window.setTimeout(run, 30);
        window.setTimeout(run, 120);
    }

    private currentTime(): string {
        return new Intl.DateTimeFormat('it-IT', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date());
    }
}
