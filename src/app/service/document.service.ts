import { Observable, Observer } from "rxjs";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AbstractService } from "../common/abstract-service";
import { Document } from "../model/document";
import { MessageService } from "primeng/api";
import { catchError, map } from "rxjs/operators";
import { ConfigurationService } from "./configuration.service";
import { DOCUMENT_API_PATH } from "../constants/constants";

@Injectable({
  providedIn: "root",
})
export class DocumentService extends AbstractService<Document> {
  private progress$: Observable<number>;
  private progress = 0;
  private progressObserver: Observer<number>;

  constructor(
    protected http: HttpClient,
    messageService: MessageService,
    configurationService: ConfigurationService,
  ) {
    super(
      configurationService.getValue(DOCUMENT_API_PATH),
      http,
      messageService,
    );
    this.progress$ = new Observable<number>((observer) => {
      this.progressObserver = observer;
    });

    this.updateProgress = this.updateProgress.bind(this);
  }

  uploadFile(document: Document, body: FormData): Observable<any> {
    if (document.uuid) {
      return this.httpClient
        .put<FormData>(this.url + "/" + document.uuid, body)
        .pipe(catchError(this.handleError));
    } else {
      return this.httpClient
        .post<FormData>(this.url, body)
        .pipe(catchError(this.handleError));
    }
  }

  public upload(
    blob: any,
    table_name: string,
    table_key: string,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if (blob) {
        this.updateProgress(0);
        const formData: FormData = new FormData();
        formData.append("file", blob);
        formData.append("table_name", table_name);
        formData.append("table_key", table_key);
        // multipart/form-data
        return this.httpClient.post<FormData>(this.url, formData).toPromise();
      }
    });
  }

  private updateProgress(progress: number): void {
    this.progress = progress;
    if (this.progressObserver) {
      this.progressObserver.next(this.progress);
    }
  }

  getId(element: Document) {
    return element.uuid;
  }

  buildSearch() {
    this.search = {
      uuid: "",
      _limit: 10,
    };
  }

  public simplDownload(uuid: string): Observable<any> {
    return this.httpClient.get(this.url + "/" + uuid + "/download", {
      responseType: "blob",
    });
  }

  public downloadPath(uuid: string): string {
    return this.url + "/" + uuid + "/download";
  }

  public download(uuid: string): Observable<any> {
    return this.simplDownload(uuid).pipe(
      map((res) => {
        if (res.size === 0) {
          return null;
        }
        return new Blob([res], { type: "application/octet-stream" });
      }),
      catchError(this.handleError),
    );
  }

  public getDocumentsByTable(
    tableName: string,
    tableKey: string,
  ): Observable<Document[]> {
    const search = {
      table_name: tableName,
      table_key: tableKey,
    };
    return this.getAllList(search);
  }

  /**
   * This method handles a "soft delete"
   * by removing table_name and table_key
   * @param document
   * @returns
   */
  public softDelete(document: Document): Observable<Document> {
    let body = this.marshall(document);
    delete body.table_key;
    delete body.table_name;
    return this.httpClient
      .put<Document>(this.url + "/" + this.getId(document), body)
      .pipe(catchError(this.handleError.bind(this)));
  }
}
