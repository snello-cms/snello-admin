import {computed, inject, Injectable, signal} from '@angular/core';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {SelectItem} from 'primeng/api';
import {AiProjectService} from './ai-project.service';
import {AiProject} from '../models/ai-project';

const STORAGE_KEY = 'snello.ai.activeProject';

/**
 * The AI project the admin is working on. Skills, MCP tools, cards and service accounts all belong to a project:
 * their lists start filtered on it and new rows default to it. Remembered per browser.
 */
@Injectable({providedIn: 'root'})
export class AiProjectContextService {

    private readonly projectService = inject(AiProjectService);

    readonly projects = signal<AiProject[]>([]);
    readonly activeUuid = signal<string>(readStored());
    readonly options = computed<SelectItem[]>(() => this.projects().map(p => ({label: p.name, value: p.uuid})));
    /** Same as options, plus "All projects" (value '') for list filters. */
    readonly filterOptions = computed<SelectItem[]>(() => [{label: 'All projects', value: ''}, ...this.options()]);

    private loaded = false;

    /** Loads the projects once per app session; {@link load} forces a refresh (after a project is saved/deleted). */
    ensureLoaded() {
        if (!this.loaded) {
            this.loaded = true;
            this.load().subscribe({error: () => this.loaded = false});
        }
    }

    load(): Observable<AiProject[]> {
        return this.projectService.getAllList({}).pipe(
            tap(projects => {
                const list = projects ?? [];
                this.projects.set(list);
                const active = this.activeUuid();
                console.log('[ai-project-context] loaded', list.length, 'projects; active', active);
                if (list.length > 0 && !list.some(p => p.uuid === active)) {
                    console.log('[ai-project-context] active project', active, 'not found, falling back to', list[0].uuid);
                    this.select(list[0].uuid);
                }
            })
        );
    }

    select(uuid: string) {
        if (!uuid) {
            return;
        }
        console.log('[ai-project-context] select', uuid);
        this.activeUuid.set(uuid);
        try {
            localStorage.setItem(STORAGE_KEY, uuid);
        } catch {
            // storage blocked: keep it for this session only
        }
    }

    name(uuid: string): string {
        return this.projects().find(p => p.uuid === uuid)?.name ?? uuid ?? '';
    }
}

function readStored(): string {
    try {
        return localStorage.getItem(STORAGE_KEY) ?? '';
    } catch {
        return '';
    }
}
