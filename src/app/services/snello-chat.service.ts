import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {take} from 'rxjs/operators';
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
        return this.http.post(this.endpoint, payload, {responseType: 'text'}).pipe(
            map(response => this.normalizeResponse(response))
        );
    }

    private normalizeResponse(response: string): SnelloChatReply {
        const parsed = this.tryParseJson(response);
        const raw = parsed ?? response;
        const text = this.extractText(raw);
        return {
            text: this.stripActionTokens(text),
            actions: this.extractActions(text)
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

    private extractActions(text: string): SnelloChatAction[] {
        const actions: SnelloChatAction[] = [];
        const regex = /\[ACTION:OPEN:([^:\]]+):([^\]]+)\]/g;
        let match: RegExpExecArray | null;

        match = regex.exec(text);
        while (match) {
            actions.push({
                type: 'open',
                entity: match[1],
                id: match[2]
            });
            match = regex.exec(text);
        }

        return actions;
    }

    private stripActionTokens(text: string): string {
        return text.replace(/\s*\[ACTION:OPEN:[^\]]+\]/g, '').trim();
    }
}