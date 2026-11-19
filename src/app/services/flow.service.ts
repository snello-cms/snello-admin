import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {ConfigurationService} from './configuration.service';
import {API_SERVICE_PATH} from '../constants/constants';
import {FlowDefinition} from '../models/flow-definition';
import {FlowInstance} from '../models/flow-instance';
import {HumanTask} from '../models/human-task';

/**
 * Quarkus Flow monitoring through snello's /api/flow (Admin / Manager): the runner and flow-bridge are internal
 * services, snello forwards to them.
 */
@Injectable({providedIn: 'root'})
export class FlowService {

    private readonly http = inject(HttpClient);
    private readonly configuration = inject(ConfigurationService);

    private base(): Observable<string> {
        return this.configuration.getConfiguration().pipe(map(c => String(c[API_SERVICE_PATH] ?? '/api') + '/flow'));
    }

    definitions(): Observable<FlowDefinition[]> {
        return this.base().pipe(switchMap(b => this.http.get<FlowDefinition[]>(b + '/definitions')));
    }

    /** The whole workflow document (JSON form of the YAML), to draw its diagram. */
    definition(d: FlowDefinition): Observable<any> {
        console.log('[flow] definition', d.namespace, d.name, d.version);
        return this.base().pipe(switchMap(b => this.http.get<any>(
            `${b}/definitions/${enc(d.namespace)}/${enc(d.name)}/${enc(d.version)}`)));
    }

    /** The same workflow as YAML, as the runner loaded it (snello converts the runner's JSON). */
    definitionYaml(d: FlowDefinition): Observable<string> {
        console.log('[flow] definition yaml', d.namespace, d.name, d.version);
        return this.base().pipe(switchMap(b => this.http.get(
            `${b}/definitions/${enc(d.namespace)}/${enc(d.name)}/${enc(d.version)}/yaml`, {responseType: 'text'})));
    }

    instances(filter: {namespace?: string; name?: string; version?: string; status?: string; limit?: number}):
        Observable<{total: number; instances: FlowInstance[]}> {
        let params = new HttpParams();
        Object.entries(filter).filter(([, v]) => v !== undefined && v !== null && v !== '')
            .forEach(([k, v]) => params = params.set(k, String(v)));
        return this.base().pipe(switchMap(b => this.http.get<{total: number; instances: FlowInstance[]}>(
            b + '/instances', {params})));
    }

    instance(id: string): Observable<FlowInstance> {
        return this.base().pipe(switchMap(b => this.http.get<FlowInstance>(b + '/instances/' + enc(id))));
    }

    /** Starts an instance (runner answers at once with its id; follow it with instance()). No version = newest. */
    start(namespace: string, name: string, input: any, version?: string): Observable<{instanceId: string; status: string}> {
        console.log('[flow] start', namespace, name, version ?? 'latest', 'input keys', Object.keys(input ?? {}));
        let params = new HttpParams();
        if (version) {
            params = params.set('version', version);
        }
        return this.base().pipe(switchMap(b => this.http.post<{instanceId: string; status: string}>(
            `${b}/start/${enc(namespace)}/${enc(name)}`, input ?? {}, {params})));
    }

    /** Human tasks opened by one instance (with their page url). */
    tasksOf(instanceId: string): Observable<HumanTask[]> {
        return this.configuration.getConfiguration().pipe(switchMap(c => this.http.get<HumanTask[]>(
            String(c[API_SERVICE_PATH] ?? '/api') + '/humantasks', {params: new HttpParams().set('instance_id', instanceId)})));
    }

    /** OPEN human tasks of a workflow (all its instances): which instances are waiting for a person. */
    openTasksOfWorkflow(namespace: string, name: string): Observable<HumanTask[]> {
        return this.configuration.getConfiguration().pipe(switchMap(c => this.http.get<HumanTask[]>(
            String(c[API_SERVICE_PATH] ?? '/api') + '/humantasks', {params: new HttpParams()
                .set('status', 'OPEN').set('workflow_namespace', namespace).set('workflow_name', name)})));
    }

    control(i: FlowInstance, action: 'suspend' | 'resume' | 'cancel'): Observable<any> {
        console.log('[flow]', action, i.instanceId);
        return this.base().pipe(switchMap(b => this.http.post(
            `${b}/instances/${enc(i.namespace)}/${enc(i.name)}/${enc(i.version)}/${enc(i.instanceId)}/${action}`, {})));
    }
}

function enc(s: string): string {
    return encodeURIComponent(s);
}
