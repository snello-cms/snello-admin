import {Injectable, OnInit} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {API_PATH, API_SERVICE_PATH} from "../../constants";
import {FieldDefinition} from "../model/field-definition";
import {Metadata} from "../model/metadata";

@Injectable()
export class ApiService implements OnInit {

  url: string;

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


  public getList(tableName: string) {
    let params = new HttpParams();
    //params = this.applyRestrictions(params, this.search);

    return this.http
      .get<any[]>(this.url + '/' + tableName, {
        observe: 'response',
        params: params,
      })
      .pipe(
        map(res => {
          // this.listSize = res.headers.get('listSize') != null ? +res.headers.get('listSize') : 0;
          // return res.body;
          const ts: any[] = res.body; // json();
          return ts;
        }),
        catchError(this.handleError)
      );
  }

}
