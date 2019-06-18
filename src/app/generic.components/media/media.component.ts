import {Component, OnInit, ViewChild} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import {ApiService} from "../../service/api.service";
import {DocumentService} from "../../service/document.service";
import {from, Observable, of} from "rxjs";
import {catchError, map} from "rxjs/operators";
import {MessageService} from "primeng/api";
import {DomSanitizer} from "@angular/platform-browser";
import {FileUpload} from "primeng/primeng";
import { Document } from 'src/app/model/document';
import { BASE_PATH } from 'src/constants';

@Component({
  selector: "app-media",
  template: `
    <div class="form-group clearfix row" [formGroup]="group">
      <div>
        <label class="col-sm-3">{{ field.name }}</label>
        <div class="col-sm-9">
          <p-fileUpload #fileInput mode="basic" [name]="field.name" (onSelect)="uploader($event)" [disabled]="!field.isEdit">
          </p-fileUpload>
        </div>        
      </div>
      <div *ngIf="!field.isEdit">
          Media component is accessible only after the record has been saved 
      </div>
      <div *ngIf="uploadedFile">
        Uploaded file name: {{uploadedFile.original_name}} 
         <a target="_blank" href="{{downloadPath()}}">Scarica</a>
        </div>
    </div>
    
  `,
  styles: []
})
export class MediaComponent implements OnInit {
  field: FieldDefinition;

  group: FormGroup;

  public uploadedFile: Document;

  @ViewChild('fileInput') fileInput: FileUpload;

  constructor(private apiService: ApiService,
              private documentService: DocumentService,
              private messageService: MessageService,
              public sanitizer: DomSanitizer
  ) {
  }

  ngOnInit() {
    this.uploadedFile = null;
    if(this.field.value != null) {
      this.showMedia(this.field.value).subscribe(
        result => {
          this.fileInput.clear();
        }
      );
    }
  }

  public uploader(event: any) {
    from(this.uploadFile(event.files[0])).subscribe();
  }

  private uploadFile(fileToUpload: any): Promise<any> {

    return this.documentService
      .upload(fileToUpload, this.field.table_name, this.field.table_key_value)
      .then(res => {
        this.group.value[this.field.name] = res.uuid;
        this.field.value = res.uuid;
        this.uploadedFile = res;
      })
      .catch(error => {
          this.messageService.add({
            severity: 'info',
            summary: 'Errore durante il caricamento del documento ',
            detail: ''
          });
          return of({});
      });
  }

  public downloadPath () {
    return BASE_PATH + this.uploadedFile.path;
  }
  private showMedia(documentUuid: string): Observable<any> {

    return this.documentService.find(documentUuid)
      .pipe(
        map(
          document => {
            this.uploadedFile = document;
          }
        ),
        catchError((err, caught) => {
          this.messageService.add({
            severity: 'info',
            summary: 'Errore durante il recupero del documento ',
            detail: ''
          });
          return of({});
        })
      );
  }
}