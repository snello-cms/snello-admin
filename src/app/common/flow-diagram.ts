import {FlowInstance} from '../models/flow-instance';

/**
 * Mermaid flowchart of a Serverless Workflow (DSL 1.0) document: one box per top-level task of `do`, arrows for the
 * task order, `then:` (a task name, `continue`, `end`, `exit`) and every `switch` case. Nested tasks (inside try / for /
 * fork / do) are shown as their top-level task: the monitor answers "where is it", not "how is it built".
 *
 * With an instance, boxes are coloured from its task events (flow-bridge): done, current (running or waiting there),
 * faulted; a task started more than once (polling loops) shows ×N.
 *
 * Runner task positions look like `do/3/waitDecision` or `do/1/mailReviewer/try/0/post`: the number after `do/` is the
 * index of the top-level task, which is all the mapping needs.
 */
export function flowDiagram(definition: any, instance?: FlowInstance | null): string {
    const tasks: {name: string; body: any}[] = (definition?.do ?? []).map((item: any) => {
        const name = Object.keys(item)[0];
        return {name, body: item[name] ?? {}};
    });
    const idOf = (i: number) => 't' + i;
    const indexOf = new Map(tasks.map((t, i) => [t.name, i]));
    const lines: string[] = ['flowchart TD', '  start((start))', '  finish((end))'];
    const edges: string[] = [];

    const target = (from: number, then: string | undefined): string => {
        if (then === 'end' || then === 'exit') {
            return 'finish';
        }
        if (then && then !== 'continue' && indexOf.has(then)) {
            return idOf(indexOf.get(then)!);
        }
        return from + 1 < tasks.length ? idOf(from + 1) : 'finish';
    };

    const state = instance ? taskStates(instance) : new Map<number, TaskView>();

    tasks.forEach((t, i) => {
        const kind = taskKind(t.body);
        const view = state.get(i);
        const label = esc(t.name) + (view && view.count > 1 ? ' ×' + view.count : '')
            + (view && view.faults > 0 ? ' ⚠' + view.faults : '')
            + `<br/><small>${esc(kind)}</small>`;
        lines.push('  ' + idOf(i) + shape(kind, label));
        if (kind === 'switch') {
            for (const c of (t.body.switch ?? [])) {
                const caseName = Object.keys(c)[0];
                const then = c[caseName]?.then;
                edges.push(`  ${idOf(i)} -->|${esc(caseName)}| ${target(i, then)}`);
            }
        } else {
            edges.push(`  ${idOf(i)} --> ${target(i, t.body.then)}`);
        }
    });
    edges.unshift('  start --> ' + (tasks.length ? idOf(0) : 'finish'));
    lines.push(...edges);

    lines.push('  classDef done fill:#d9f2e3,stroke:#2e8b57,color:#123;');
    lines.push('  classDef current fill:#cfe2ff,stroke:#0d6efd,stroke-width:4px,color:#012;');
    lines.push('  classDef faulted fill:#f8d7da,stroke:#dc3545,stroke-width:3px,color:#300;');
    lines.push('  classDef retried fill:#fff3cd,stroke:#b8860b,stroke-width:2px,color:#332;');
    lines.push('  classDef terminal fill:#eee,stroke:#888,color:#333;');
    lines.push('  class start,finish terminal;');
    if (instance) {
        lines.push('  class start done;');
        if (instance.status === 'COMPLETED') {
            lines.push('  class finish done;');
        }
        state.forEach((v, i) => lines.push(`  class ${idOf(i)} ${v.css};`));
    }
    return lines.join('\n');
}

interface TaskView {
    css: 'done' | 'current' | 'faulted' | 'retried';
    count: number;
    faults: number;
}

/** Per top-level task index: how it looks for this instance. */
function taskStates(instance: FlowInstance): Map<number, TaskView> {
    const out = new Map<number, TaskView>();
    const top = (pos?: string) => {
        const m = /^do\/(\d+)/.exec(pos ?? '');
        return m ? Number(m[1]) : -1;
    };
    for (const [pos, t] of Object.entries(instance.tasks ?? {})) {
        const i = top(pos);
        if (i < 0) {
            continue;
        }
        const v: TaskView = out.get(i) ?? {css: 'done', count: 0, faults: 0};
        v.faults += t.faults ?? 0;
        // runs: the top-level task's own position (do/3/waitDecision) or, for try tasks, its try block
        // (do/4/readDecision/try); deeper positions would double count
        const depth = pos.split('/').length;
        if (depth === 3 || (depth === 4 && pos.endsWith('/try'))) {
            v.count = Math.max(v.count, t.count);
        }
        if (t.state === 'faulted') {
            v.css = 'faulted';
        } else if ((t.faults ?? 0) > 0 && v.css === 'done') {
            v.css = 'retried';  // faulted, retried, then completed
        }
        out.set(i, v);
    }
    const active = !['COMPLETED', 'FAULTED', 'CANCELLED'].includes(instance.status);
    const current = top(instance.currentPosition);
    if (active && current >= 0) {
        out.set(current, {css: 'current', count: out.get(current)?.count ?? 1, faults: out.get(current)?.faults ?? 0});
    }
    const failed = top(instance.error?.position);
    if (instance.status === 'FAULTED' && failed >= 0) {
        out.set(failed, {css: 'faulted', count: out.get(failed)?.count ?? 1, faults: out.get(failed)?.faults ?? 0});
    }
    return out;
}

function taskKind(body: any): string {
    const kinds = ['call', 'set', 'wait', 'switch', 'try', 'for', 'fork', 'do', 'emit', 'listen', 'raise', 'run'];
    const k = kinds.find(x => body && x in body) ?? 'task';
    if (k === 'call') {
        const method = body.with?.method;
        return 'call ' + body.call + (method ? ' ' + String(method).toUpperCase() : '');
    }
    if (k === 'try') {
        const inner = (body.try ?? [])[0];
        const innerBody = inner ? inner[Object.keys(inner)[0]] : null;
        return 'try: ' + (innerBody ? taskKind(innerBody) : 'tasks');
    }
    if (k === 'wait') {
        // the runner expands durations ({days: 0, hours: 0, ..., seconds: 20}): keep the non-zero parts
        const w = body.wait ?? {};
        const parts = typeof w === 'string' ? [w]
            : Object.entries(w).filter(([, n]) => Number(n) > 0).map(([u, n]) => n + ' ' + u);
        return 'wait ' + (parts.join(' ') || '0');
    }
    return k;
}

function shape(kind: string, label: string): string {
    if (kind === 'switch') {
        return `{"${label}"}`;
    }
    if (kind.startsWith('wait')) {
        return `(["${label}"])`;
    }
    if (kind.startsWith('try')) {
        return `[["${label}"]]`;
    }
    return `["${label}"]`;
}

/** Mermaid label text: no quotes, brackets or pipes that would end the label. */
function esc(s: string): string {
    return String(s ?? '').replace(/["|<>{}\[\]]/g, ' ').slice(0, 80);
}
