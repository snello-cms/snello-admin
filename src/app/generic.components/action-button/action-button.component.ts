import {ChangeDetectionStrategy, Component, ElementRef, OnInit, signal} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {FieldDefinition} from '../../models/field-definition';
import {ActionButtonConfig} from '../../models/action-button-config';
import {ActionButtonFile} from '../../models/action-button-file';
import {ActionButtonLookup} from '../../models/action-button-lookup';
import {ApiService} from '../../services/api.service';

/**
 * A {@code button} field: a form action configured by the field's {@code function_def} (see ActionButtonConfig).
 * "prefill" uploads files to a service and fills the form with its answer, e.g. "Scan document" on a customer:
 * the id-scan service reads the ID card and the customer's fields are filled. Nothing is saved: the operator checks
 * the form and saves as usual.
 */
@Component({
    selector: 'app-action-button',
    standalone: true,
    template: `
        <div class="form-group clearfix action-button">
          <div class="row">
            <label class="col-sm-3">{{ field.label || field.name }}</label>
            <div class="col-sm-9">
              @if (configError) {
                <div class="alert alert-warning">Button not configured: {{ configError }}</div>
              } @else {
                <div class="action-button-files">
                  @for (f of files; track f.name) {
                    <label class="action-button-file">
                      <span>{{ f.label || f.name }}{{ f.required ? ' (*)' : '' }}</span>
                      <input type="file" [attr.data-file]="f.name" [attr.accept]="f.accept || 'image/*,application/pdf'" capture="environment"
                             (change)="pick(f, $event)" [attr.aria-label]="f.label || f.name"/>
                    </label>
                  }
                  <button type="button" class="btn btn-search" [disabled]="busy()" (click)="run()">
                    <i class="fa" [class.fa-spinner]="busy()" [class.fa-spin]="busy()" [class.fa-id-card]="!busy()"></i>
                    {{ busy() ? 'Working…' : (config?.button || field.label || 'Run') }}
                  </button>
                </div>
                @if (error()) {
                  <div class="alert alert-danger action-button-msg" role="alert">{{ error() }}</div>
                }
                @if (mock()) {
                  <div class="alert alert-info action-button-msg">Test data: the service answered sample values (no provider configured).</div>
                }
                @if (filled().length) {
                  <div class="alert alert-success action-button-msg">Filled: {{ filled().join(', ') }}. Check them, then save.</div>
                }
                @if (kept().length) {
                  <div class="alert alert-secondary action-button-msg">Different on the document, not changed: {{ kept().join(', ') }}</div>
                }
                @for (w of warnings(); track w) {
                  <div class="alert alert-warning action-button-msg">{{ w }}</div>
                }
              }
            </div>
          </div>
        </div>
    `,
    styles: [`
        .action-button-files { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; }
        .action-button-file { display: flex; flex-direction: column; gap: 4px; font-size: 0.9em; max-width: 100%; }
        .action-button-file input { max-width: 100%; }
        .action-button-msg { margin: 8px 0 0; padding: 6px 10px; }
    `],
    changeDetection: ChangeDetectionStrategy.Eager
})
export class ActionButtonComponent implements OnInit {
    field: FieldDefinition;
    group: UntypedFormGroup;
    /** every field of the form (set by the dynamic field directive): to convert values by the target's type */
    allFields: FieldDefinition[] = [];

    config: ActionButtonConfig | null = null;
    configError = '';
    files: ActionButtonFile[] = [];
    private picked = new Map<string, File>();

    busy = signal(false);
    error = signal('');
    mock = signal(false);
    filled = signal<string[]>([]);
    kept = signal<string[]>([]);
    warnings = signal<string[]>([]);

    constructor(private http: HttpClient, private apiService: ApiService, private host: ElementRef<HTMLElement>) {
    }

    ngOnInit() {
        try {
            const parsed = JSON.parse(this.field.function_def || '{}') as ActionButtonConfig;
            if (parsed.action !== 'prefill' || !parsed.url) {
                this.configError = 'function_def needs {"action": "prefill", "url": ...}';
            } else {
                this.config = parsed;
                this.files = parsed.files?.length ? parsed.files : [{name: 'file', label: 'File', required: true}];
            }
        } catch (e) {
            this.configError = 'function_def is not JSON';
        }
        console.info('[action-button]', this.field.metadata_name + '.' + this.field.name,
            this.config ? `prefill -> ${this.config.url}, files ${this.files.map(f => f.name)}` : this.configError);
    }

    pick(file: ActionButtonFile, event: Event) {
        const chosen = (event.target as HTMLInputElement).files?.[0];
        if (chosen) {
            this.picked.set(file.name, chosen);
        } else {
            this.picked.delete(file.name);
        }
        console.debug('[action-button] picked', file.name, chosen?.type, chosen?.size);
    }

    async run() {
        if (!this.config) {
            return;
        }
        // read what the inputs hold now (a change event can be missed: restored form, scripted upload)
        this.host.nativeElement.querySelectorAll<HTMLInputElement>('input[type=file][data-file]').forEach(input => {
            const chosen = input.files?.[0];
            if (chosen) {
                this.picked.set(input.dataset['file']!, chosen);
            }
        });
        const missing = this.files.filter(f => f.required && !this.picked.has(f.name)).map(f => f.label || f.name);
        this.error.set(missing.length ? `Choose ${missing.join(', ')} first.` : '');
        if (missing.length) {
            return;
        }
        const body = new FormData();
        this.picked.forEach((file, name) => body.append(name, file, file.name));
        this.busy.set(true);
        this.filled.set([]);
        this.kept.set([]);
        this.warnings.set([]);
        this.mock.set(false);
        console.info('[action-button] POST', this.config.url, 'files', [...this.picked.keys()]);
        try {
            // the admin's interceptor adds the user's bearer token
            const answer = await firstValueFrom(this.http.post<any>(this.config.url, body));
            await this.apply(answer);
        } catch (e) {
            const err = e as HttpErrorResponse;
            const reason = typeof err?.error === 'string' ? err.error
                : err?.error?.error || err?.error?.details || err?.error?.message || err?.error?.title || err?.message
                    || String(e);
            console.warn('[action-button] failed', err?.status, reason);
            this.error.set(err?.status === 0
                ? `The service at ${this.config.url} is not reachable.`
                : `The service answered ${err?.status ?? ''}: ${reason}`);
        } finally {
            this.busy.set(false);
        }
    }

    private async apply(answer: any) {
        const config = this.config!;
        const result: Record<string, unknown> = (config.result ? answer?.[config.result] : answer) ?? {};
        const filled: string[] = [];
        const kept: string[] = [];
        for (const [name, raw] of Object.entries(result)) {
            if (raw === null || raw === undefined || raw === '' || name === this.field.name) {
                continue;
            }
            const control = this.group.get(name);
            const target = this.fieldByName(name);
            if (!control || !target) {
                console.debug('[action-button] answer key without a form field:', name);
                continue;
            }
            const value = await this.convert(target, raw);
            this.assign(target, control.value, value, filled, kept);
        }
        const warnings = config.warnings ? answer?.[config.warnings] : null;
        this.warnings.set(Array.isArray(warnings) ? warnings.map(String) : []);
        for (const lookup of config.lookups ?? []) {
            await this.lookup(lookup, result, answer, filled, kept);
        }
        this.filled.set(filled);
        this.kept.set(kept);
        this.mock.set(config.mock ? answer?.[config.mock] === true : false);
        console.info('[action-button] applied: filled', filled.length, 'kept', kept.length, 'warnings',
            this.warnings().length, 'mock', this.mock());
    }

    /** Fills an empty field; a field with a different value is only replaced with overwrite=true. */
    private assign(target: FieldDefinition, current: unknown, value: unknown, filled: string[], kept: string[]) {
        const label = target.label || target.name!;
        const empty = current === null || current === undefined || current === ''
            || (typeof current === 'object' && !(current instanceof Date) && Object.keys(current as object).length === 0);
        if (!empty && !this.config!.overwrite) {
            if (this.comparable(current, target) !== this.comparable(value, target)) {
                kept.push(label);
            }
            return;
        }
        const control = this.group.get(target.name!)!;
        control.setValue(value);
        control.markAsDirty();
        filled.push(label);
    }

    private async lookup(lookup: ActionButtonLookup, result: Record<string, unknown>, answer: unknown,
                         filled: string[], kept: string[]) {
        let value: unknown;
        if (lookup.value.startsWith('/')) {
            // a path in the whole answer: "/hints/nationality"
            value = lookup.value.split('/').filter(Boolean)
                .reduce((node: any, key) => (node && typeof node === 'object' ? node[key] : undefined), answer);
        } else if (lookup.value.startsWith('@')) {
            const [fieldName, column] = lookup.value.substring(1).split('.');
            const selected = this.group.get(fieldName)?.value;
            value = selected && typeof selected === 'object' ? selected[column] : undefined;
        } else {
            value = result[lookup.value];
        }
        const target = this.fieldByName(lookup.into);
        if (value === null || value === undefined || value === '' || !target) {
            return;
        }
        const rows = await firstValueFrom(this.apiService.fetchObjectsByKeys(lookup.table, lookup.by, [String(value)],
            this.lookupColumns(lookup, target)));
        const row = rows?.[0];
        console.info('[action-button] lookup', lookup.table, lookup.by, '=', value, '->', row ? 'found' : 'not found');
        if (!row && lookup.optional) {
            return;
        }
        if (!row) {
            this.warnings.update(w => [...w, `${target.label || target.name}: ${lookup.by} ${value} not found in ${lookup.table}`]);
            return;
        }
        const assigned = target.type === 'join' ? row : row[lookup.column || 'uuid'];
        this.assign(target, this.group.get(target.name!)?.value, assigned, filled, kept);
    }

    /**
     * Columns to read from the looked-up table: without select_fields snello answers only the table's list columns,
     * which may miss the searched column (rows are matched on it) and the ones a later "@field.column" step reads.
     */
    private lookupColumns(lookup: ActionButtonLookup, target: FieldDefinition): string {
        const columns = new Set<string>([lookup.by, 'uuid']);
        if (target.type === 'join') {
            columns.add(target.join_table_key || 'uuid');
            (target.join_table_select_fields || '').split(',').map(c => c.trim()).filter(Boolean).forEach(c => columns.add(c));
        } else if (lookup.column) {
            columns.add(lookup.column);
        }
        for (const other of this.config?.lookups ?? []) {
            if (other.value.startsWith('@' + lookup.into + '.')) {
                columns.add(other.value.substring(lookup.into.length + 2));
            }
        }
        return [...columns].join(',');
    }

    /** The service answers text: dates become Date (the date pickers' value), joins their row, checkboxes booleans. */
    private async convert(target: FieldDefinition, raw: unknown): Promise<unknown> {
        const text = String(raw);
        switch (target.type) {
            case 'date':
                return /^\d{4}-\d{2}-\d{2}$/.test(text) ? new Date(text + 'T00:00:00') : new Date(text);
            case 'datetime':
                return new Date(text);
            case 'checkbox':
                return raw === true || text === 'true';
            case 'join': {
                const row = await firstValueFrom(this.apiService.fetchJoinedObject(target.join_table_name,
                    target.join_table_key, text, target.join_table_select_fields));
                return row ?? text;
            }
            default:
                return raw;
        }
    }

    private comparable(value: unknown, target: FieldDefinition): string {
        if (value instanceof Date) {
            return value.toISOString().substring(0, 10);
        }
        if (value && typeof value === 'object') {
            return String((value as any)[target.join_table_key || 'uuid'] ?? '');
        }
        return String(value ?? '').trim().toLowerCase();
    }

    private fieldByName(name: string): FieldDefinition | undefined {
        return this.allFields.find(f => f.name === name);
    }
}
