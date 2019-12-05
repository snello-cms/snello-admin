import {HttpClient, HttpErrorResponse, HttpParams, HttpResponse} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {MessageService} from 'primeng/api';

export abstract class AbstractService<T> {
    listSize: number;
    _limit = 1;
    _start = 0;
    search: any;
    url: string;


    constructor(protected urlValue: Observable<string>, protected httpClient: HttpClient, protected messageService: MessageService) {
        this.urlValue.subscribe(
            value => this.url = value
        );
        this.initialize();
    }

    private initialize() {
        this.buildSearch();
        this.init();
    }

    public getList(): Observable<any> {
        return this.getListSearch(this.search, this._start, this._limit);
    }

    public getListSearch(search: any, start: number, limit: number): Observable<any> {
        let params = new HttpParams();
        params = params.set('_start', this.toQueryParam('_start', start));
        params = params.set('_limit', this.toQueryParam('_limit', limit));
        params = this.applyRestrictions(params, search);

        return this.httpClient
            .get<T[]>(this.url, {
                observe: 'response',
                params: params,
            })
            .pipe(
                map(res => {
                    // this.listSize = res.headers.get('listSize') != null ? +res.headers.get('listSize') : 0;
                    // return res.body;
                    this.listSize = res.headers.get('x-total-count') != null ? +res.headers.get('x-total-count') : 0;
                    const ts: T[] = res.body; // json();
                    this.postList(ts);
                    return ts;
                }),
                catchError(this.handleError.bind(this))
            );
    }


    public size(): Observable<number> {
        let params = new HttpParams();
        this._start = 0;
        this._limit = 10;
        this.toQueryParam('_start', this._start);
        this.toQueryParam('_limit', this._limit);
        params = this.applyRestrictions(params, this.search);

        return this.httpClient
            .get(this.url + '/listSize', {
                observe: 'response',
                params: params
            })
            .pipe(
                map((res: HttpResponse<number>) => {
                    return res.headers.get('size') != null
                        ? +res.headers.get('size')
                        : 0;
                }),
                catchError(this.handleError.bind(this))
            );
    }

    public getListSize() {
        if (this.listSize) {
            return this.listSize;
        }
        return 0;
    }

    public find(id: string) {
        return this.httpClient.get<T>(this.url + '/' + id, {
            observe: 'response',
        }).pipe(
            map(res => {
                const t: any = <any>res.body; // json();
                this.postFind(t);
                return t;
            }),
            catchError(this.handleError.bind(this))
        );
    }

    protected applyRestrictions(
        params: HttpParams,
        search: any) {

        for (const key in search) {
            if (search[key] !== null) {
                if (!(search[key] instanceof Object)) {
                    params = params.set(
                        key,
                        this.toQueryParam(key, search[key])
                    );
                } else if (search[key] instanceof Date) {
                    params = params.set(key,
                        this.toQueryParam(key, search[key])
                    );
                }
            }
        }
        return params;
    }

    public newInstance(type: { new(): T }): T {
        return new type();
    }

    public delete(id: string): Observable<any> {
        return this.httpClient
            .delete(this.url + '/' + id, {responseType: 'text'})
            .pipe(catchError(this.handleError.bind(this)));
    }

    public persist(element: T): Observable<T> {
        const body = this.marshall(element);
        return this.httpClient
            .post<T>(this.url, body)
            .pipe(catchError(this.handleError.bind(this)));
    }

    public update(element: T): Observable<T> {
        const body = this.marshall(element);
        return this.httpClient
            .put<T>(this.url + '/' + this.getId(element), body)
            .pipe(catchError(this.handleError.bind(this)));
    }

    public getInstance(TCreator: { new(): T }): T {
        return new TCreator();
    }

    public getAllList(search?: any): Observable<T[]> {
        let params = new HttpParams();

        if (search == null) {
            search = JSON.parse(JSON.stringify(this.search));
        }
        search._limit = 100000;
        params = this.applyRestrictions(params, search);

        return this.httpClient.get<HttpResponse<T []>>(this.url, {
            observe: 'response',
            params: params
        }).pipe(
            map(res => {
                    const ts: any = res.body;
                    this.postList(ts);
                    return ts;
                }
            ),
            catchError(this.handleError.bind(this))
        );
    }

    protected init() {
    }

    protected toQueryParam(field: string, value: any) {
        if (value instanceof Date) {
            return (value as Date).toLocaleString('it-IT', {hour12: false});
        }
        return value;
    }

    public abstract getId(element: T);

    public abstract buildSearch();

    protected handleError(error: HttpErrorResponse): Observable<any> {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        if (this.messageService) {
            const errorMsg = error['msg'] ? error['msg'] : 'Errore generico';
            this.messageService.add({
                severity: 'error',
                summary: errorMsg,
                // detail: 'Via MessageService'
            });
        }
        return Observable.throw(error['msg'] || 'Server error');
    }

    protected unmarshall(element: T) {
    }

    protected marshall(element: T) {
        // return JSON.stringify(element);
        return element;
    }

    protected postList(ts: T[]) {
        for (let t = 0; t < ts.length; t++) {
            this.unmarshall(ts[t]);
        }
    }

    protected postFind(t: T) {
        this.unmarshall(t);
    }
}
