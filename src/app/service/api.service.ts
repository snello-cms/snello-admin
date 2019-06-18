import {Injectable, OnInit} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {API_SERVICE_PATH} from "../../constants";
import {FieldDefinition} from "../model/field-definition";

@Injectable()
export class ApiService implements OnInit {

  url: string;
  _start: number;
  _limit: number;
  listSize: number;

  public map: Map<string, FieldDefinition[]> = new Map<string, FieldDefinition[]>();

  constructor(protected http: HttpClient) {
    this.url = API_SERVICE_PATH;

  }

  ngOnInit(): void {
  }


  public handleError(error: HttpErrorResponse): Observable<any> {
    if (error.status === 401) {
      return Observable.throw({status: error.status, error: 'Unauthorized'});
    } else if (error.status === 500) {
      return Observable.throw({status: error.status, error: error.message || error.error});
    }
    return Observable.throw(error.message /*json().msg*/ || error.error /*json().error*/ || 'Server error');
  }

  updateMap(tableName: string, definitions: FieldDefinition[]) {
    this.map.set(tableName, definitions);
  }

  getDefinitions(tableName: string): FieldDefinition[] {
    return this.map.get(tableName);
  }

  public persist(tableName: string, element: any): Observable<any> {
    let url = this.url + "/" + tableName;
    const body = element;
    return this.http
      .post<any>(url, body)
      .pipe(catchError(this.handleError));
  }

  public delete(tableName: string, table_key: string): Observable<any> {
    let url = this.url + "/" + tableName + "/" + table_key;
    return this.http
      .delete(url, {responseType: 'text'})
      .pipe(catchError(this.handleError.bind(this)));
  }

  public update(tableName: string, table_key: string, element: any): Observable<any> {
    let url = this.url + "/" + tableName + "/" + table_key;
    const body = element;
    return this.http
      .put<any>(url, body)
      .pipe(catchError(this.handleError));
  }

  public fetch(tableName: string, table_key: string) {
    let url = this.url + "/" + tableName + "/" + table_key;
    return this.http.get(url, {
      observe: 'response',
    }).pipe(
      map(res => {
        const t: any = <any>res.body; // json();
        return t;
      }),
      catchError(this.handleError)
    );
  }


  public getList(tableName: string, regConfigSearch: FieldDefinition[]) {
    let params = new HttpParams();
    params = params.set('_start', this._start + '');
    params = params.set("_limit", this._limit + '');
    params = this.applyRestrictions(params, regConfigSearch);
    return this.http
      .get<any[]>(this.url + '/' + tableName, {
        observe: 'response',
        params: params,
      })
      .pipe(
        map(res => {
          const keys = res.headers.keys();
          console.log(keys);
          let headers = keys.map(key => {
              `${key}: ${res.headers.get(key)}`
            }
          );
          console.log(headers);
          this.listSize = res.headers.get('size') != null ? +res.headers.get('size') : 0;
          console.log(this.listSize);
          const ts: any[] = res.body; // json();
          return ts;
        }),
        catchError(this.handleError)
      );
  }

  private applyRestrictions(params: HttpParams, regConfigSearch?: FieldDefinition[]): any {

    for (const key of regConfigSearch) {
      if (key.value != null) {
        params = params.set(
          key.search_field_name,
          key.value
        );
      }

    }
    return params;
  }

  public getJoinList(field: FieldDefinition, searchValue?: string, search_field?:string): Observable<any[]> {
    let params = new HttpParams();
    //per ora senza ricerca e non paginate, in futuro chissà..
    params = params.set('select_fields', field.join_table_select_fields + ',' + field.join_table_key);

    if (searchValue) {
      params = params.set(
        search_field + "_contains",
        searchValue
      );
    }
    return this.http
      .get<any[]>(this.url + '/' + field.join_table_name, {
        observe: 'response',
        params: params,
      })
      .pipe(
        map(res => {
          const keys = res.headers.keys();
          console.log(keys);
          let headers = keys.map(key => {
              `${key}: ${res.headers.get(key)}`
            }
          );
          console.log(headers);
          const ts: any[] = res.body; // json();
          return ts;
        }),
        catchError(this.handleError)
      );
  }

  protected toQueryParam(field: string, value: any) {
    if (value instanceof Date) {
      return (value as Date).toLocaleString('it-IT', {hour12: false});
    }
    return value;
  }


}
