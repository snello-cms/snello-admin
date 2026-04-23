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
        const extractedActions = this.extractActions(raw, text);
        return {
            text: cleanText,
            html,
            actions: this.withMetadataFallbackActions(cleanText, extractedActions)
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

        const metadataRegex = /\[ACTION:METADATA:([^\]]+)\]/g;
        match = metadataRegex.exec(text);
        while (match) {
            const entity = match[1]?.trim();
            if (entity) {
                actions.push({
                    type: 'navigate',
                    path: `/datalist/list/${encodeURIComponent(entity)}`,
                    entity,
                    label: `Apri metadato ${entity}`
                });
            }
            match = metadataRegex.exec(text);
        }

        return actions;
    }

    private withMetadataFallbackActions(text: string, actions: SnelloChatAction[]): SnelloChatAction[] {
        const normalized = this.dedupeActions(actions);
        if (this.hasMetadataNavigation(normalized)) {
            return normalized;
        }

        const inferredEntity = this.extractMetadataEntity(text);
        if (inferredEntity) {
            return this.dedupeActions([
                ...normalized,
                {
                    type: 'navigate',
                    path: `/datalist/list/${encodeURIComponent(inferredEntity)}`,
                    entity: inferredEntity,
                    label: `Apri metadato ${inferredEntity}`
                }
            ]);
        }

        if (this.looksLikeMetadataAnswer(text)) {
            return this.dedupeActions([
                ...normalized,
                {
                    type: 'navigate',
                    path: '/metadata/list',
                    entity: 'metadata',
                    label: 'Apri elenco metadati'
                }
            ]);
        }

        return normalized;
    }

    private looksLikeMetadataAnswer(text: string): boolean {
        const lower = text.toLowerCase();
        return lower.includes('metadata')
            || lower.includes('metadato')
            || lower.includes('metadati')
            || lower.includes('table_name')
            || lower.includes('tabella');
    }

    private extractMetadataEntity(text: string): string | undefined {
        const patterns = [
            /(?:metadat[oa]\\s+)([a-z][a-z0-9_]{1,})/i,
            /(?:table|tabella)\\s+([a-z][a-z0-9_]{1,})/i,
            /`([a-z][a-z0-9_]{1,})`/i
        ];

        for (const pattern of patterns) {
            const match = pattern.exec(text);
            const candidate = match?.[1]?.trim();
            if (!candidate) {
                continue;
            }

            const lower = candidate.toLowerCase();
            if (['metadata', 'metadato', 'metadati', 'table', 'tabella', 'list'].includes(lower)) {
                continue;
            }
            return candidate;
        }

        return undefined;
    }

    private hasMetadataNavigation(actions: SnelloChatAction[]): boolean {
        return actions.some(action => {
            if (action.type !== 'navigate') {
                return false;
            }

            const path = (action.path || action.entity || '').toLowerCase();
            return path.includes('/metadata/') || path.includes('/datalist/list/');
        });
    }

    private dedupeActions(actions: SnelloChatAction[]): SnelloChatAction[] {
        const seen = new Set<string>();
        return actions.filter(action => {
            const key = [action.type, action.path || '', action.entity || '', action.id || '', action.label || ''].join('|');
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
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
            .replace(/\s*\[ACTION:METADATA:[^\]]+\]/g, '')
            .trim();
    }
}