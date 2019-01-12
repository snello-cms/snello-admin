import { Search } from './search';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
  HttpResponse
} from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export abstract class AbstractService<T> {
  listSize: number;
  search: Search<T>;

  constructor(protected url: string, protected httpClient: HttpClient) {
    this.initialize();
  }

  private initialize() {
    this.buildSearch();
    this.init();
  }

  protected init() {}

  public getList() {
    let params = new HttpParams();
    params = this.applyRestrictions(params, this.search);

    return this.httpClient
      .get<T[]>(this.url, {
        observe: 'response',
        params: params,
      })
      .pipe(
        map(res => {
          // this.listSize = res.headers.get('listSize') != null ? +res.headers.get('listSize') : 0;
          // return res.body;
            this.listSize = res.headers.get('listSize') != null ? +res.headers.get('listSize') : 0;
            const ts: T[] = res.body; // json();
            this.postList(ts);
            return ts;
        }),
        catchError(this.handleError)
      );
  }

  public getListSize() {
    if (this.listSize) {
      return this.listSize;
    }
    return 0;
  }

  public size(): Observable<number> {
    let params = new HttpParams();
    this.search.startRow = 0;
    this.search.pageSize = 1;
    params = this.applyRestrictions(params, this.search);

    return this.httpClient
      .get(this.url + '/listSize', {
        observe: 'response',
        params: params
      })
      .pipe(
        map((res: HttpResponse<number>) => {
          return res.headers.get('listSize') != null
            ? +res.headers.get('listSize')
            : 0;
        }),
        catchError(this.handleError)
      );
  }

  protected applyRestrictions(
    params: HttpParams,
    search: any,
    prefix?: string
  ) {
    if (!prefix) {
      prefix = '';
    } else {
      prefix = prefix + '.';
    }
    for (const key in search) {
      if (search[key] !== null) {
        if (!(search[key] instanceof Object)) {
          params = params.set(
            prefix + key,
            this.toQueryParam(prefix + key, search[key])
          );
        } else if (search[key] instanceof Date) {
          params = params.set(
            prefix + key,
            this.toQueryParam(prefix + key, search[key])
          );
        } else {
          params = this.applyRestrictions(params, search[key], prefix + key);
        }
      }
    }
    return params;
  }

  protected toQueryParam(field: string, value: any) {
    if (value instanceof Date) {
      return (value as Date).toLocaleString('it-IT', { hour12: false });
    }
    return value;
  }

  // public find(id: string): Observable<T> {
  //   return this.httpClient
  //     .get<T>(this.url + '/' + id)
  //     .pipe(catchError(this.handleError));
  // }

    public find(id: string) {
        return this.httpClient.get<T>(this.url + '/' + id, {
            observe: 'response',
        }).pipe(
            map(res => {
                const t: any = <any>res.body; // json();
                this.postFind(t);
                return t;
            }),
            catchError(this.handleError)
        );
    }

  public newInstance(type: { new (): T }): T {
    return new type();
  }

  public delete(id: string): Observable<any> {
    return this.httpClient
      .delete(this.url + '/' + id, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  public persist(element: T): Observable<T> {
      const body = this.marshall(element);
    return this.httpClient
      .post<T>(this.url, body)
      .pipe(catchError(this.handleError));
  }

  public update(element: T): Observable<T> {
      const body = this.marshall(element);
    return this.httpClient
      .put<T>(this.url + '/' + this.getId(element), body)
      .pipe(catchError(this.handleError));
  }

  protected handleError(error: HttpErrorResponse): Observable<any> {
    // in a real world app, we may send the error to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error);
    return Observable.throw(error['msg'] || 'Server error');
  }

  public getInstance(TCreator: { new (): T }): T {
    return new TCreator();
  }

  public abstract getId(element: T);

  public abstract buildSearch();

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

    public getAllList(search?: Search<T>): Observable<T[]> {
        let params = new HttpParams();

        if (search == null) {
            search = JSON.parse(JSON.stringify(this.search));
        }
        search.pageSize = 100000;
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
            catchError(this.handleError)
        );
    }
}
