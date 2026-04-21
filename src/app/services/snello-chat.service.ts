import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {take} from 'rxjs/operators';
import {marked} from 'marked';
import {CHAT_API_PATH} from '../constants/constants';
import {ConfigurationService} from './configuration.service';
import {SnelloChatRequest} from '../models/snello-chat-request';
import {SnelloChatAction} from '../models/snello-chat-action';
import {SnelloChatReply} from '../models/snello-chat-reply';
import {RawChatResponse} from '../models/snello-chat-raw-response';

@Injectable({
    providedIn: 'root'
})
export class SnelloChatService {
    private endpoint = '/api/chat';

    constructor(private readonly http: HttpClient, configurationService: ConfigurationService) {
        configurationService.getValue(CHAT_API_PATH).pipe(take(1)).subscribe(url => {
            if (url) {
                this.endpoint = url;
            }
        });
    }

    sendMessage(payload: SnelloChatRequest): Observable<SnelloChatReply> {
        const enriched: SnelloChatRequest = {...payload, language: 'en'};
        return this.http.post(this.endpoint, enriched, {responseType: 'text'}).pipe(
            map(response => this.normalizeResponse(response))
        );
    }

    private normalizeResponse(response: string): SnelloChatReply {
        const parsed = this.tryParseJson(response);
        const raw = parsed ?? response;
        const text = this.extractText(raw);
        const cleanText = this.stripActionTokens(text);
        const html = this.extractHtml(raw, cleanText);
        return {
            text: cleanText,
            html,
            actions: this.extractActions(raw, text)
        };
    }

    private tryParseJson(response: string): RawChatResponse | null {
        try {
            return JSON.parse(response) as RawChatResponse;
        } catch {
            return null;
        }
    }

    private extractText(response: RawChatResponse): string {
        if (typeof response === 'string') {
            return response;
        }

        return response.reply
            || response.message
            || response.content
            || response.text
            || response.response
            || 'Nessuna risposta disponibile.';
    }

    private extractHtml(response: RawChatResponse, fallbackText: string): string {
        if (typeof response !== 'string' && response.html) {
            return response.html;
        }
        return marked(fallbackText) as string;
    }

    private extractActions(response: RawChatResponse, text: string): SnelloChatAction[] {
        const inlineActions = this.extractInlineActions(text);
        if (typeof response === 'string' || !Array.isArray(response.actions)) {
            return inlineActions;
        }
        return [...response.actions, ...inlineActions];
    }

    private extractInlineActions(text: string): SnelloChatAction[] {
        const actions: SnelloChatAction[] = [];

        const openRegex = /\[ACTION:OPEN:([^:\]]+):([^\]]+)\]/g;
        let match = openRegex.exec(text);
        while (match) {
            actions.push({
                type: 'open',
                entity: match[1],
                id: match[2]
            });
            match = openRegex.exec(text);
        }

        const navigateRegex = /\[ACTION:NAVIGATE:([^\]]+)\]/g;
        match = navigateRegex.exec(text);
        while (match) {
            actions.push({
                type: 'navigate',
                path: match[1],
                entity: match[1],
                label: 'Apri percorso'
            });
            match = navigateRegex.exec(text);
        }

        const previewRegex = /\[ACTION:CREATE_PREVIEW:([^:\]]+):([^\]]+)\]/g;
        match = previewRegex.exec(text);
        while (match) {
            actions.push({
                type: 'create_preview',
                entity: match[1],
                payload: this.decodePayload(match[2]),
                label: `Riepilogo creazione ${match[1]}`
            });
            match = previewRegex.exec(text);
        }

        return actions;
    }

    private decodePayload(encoded: string): Record<string, unknown> {
        try {
            const decoded = atob(encoded);
            const parsed = JSON.parse(decoded);
            return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {};
        } catch {
            return {};
        }
    }

    private stripActionTokens(text: string): string {
        return text
            .replace(/\s*\[ACTION:OPEN:[^\]]+\]/g, '')
            .replace(/\s*\[ACTION:NAVIGATE:[^\]]+\]/g, '')
            .replace(/\s*\[ACTION:CREATE_PREVIEW:[^\]]+\]/g, '')
            .trim();
    }
}