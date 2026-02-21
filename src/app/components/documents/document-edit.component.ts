import { DocumentService } from "./../../service/document.service";
import { Document } from "./../../model/document";
import { Component, OnInit, ViewChild } from "@angular/core";
import { AbstractEditComponent } from "../../common/abstract-edit-component";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService, MessageService } from "primeng/api";
import { FileUpload } from "primeng/fileupload";
import { catchError } from "rxjs/operators";
import { forkJoin, of } from "rxjs";
import { Location } from "@angular/common";

@Component({
  templateUrl: "./document-edit.component.html",
})
export class DocumentEditComponent
  extends AbstractEditComponent<Document>
  implements OnInit
{
  public uploading = false;
  public uploadedFile: string;
  public progress: number;
  public processed = false;
  public displayProgressBar: boolean;

  protected galleryImages: Document[] = [];

  @ViewChild("fileUploader", { static: false }) fileUploader: FileUpload = null;


  constructor(
    router: Router,
    route: ActivatedRoute,
    confirmationService: ConfirmationService,
    private documentService: DocumentService,
    private location: Location,
    public messageService: MessageService,
  ) {
    super(
      router,
      route,
      confirmationService,
      documentService,
      messageService,
      "document",
    );
  }

  createInstance(): Document {
    return new Document();
  }

  ngOnInit() {
    this.element = new Document();
    super.ngOnInit();
  }

  /**
   * @todo refactor how "new" is being detected. Right now this reflects src/app/common/abstract-edit-component.ts to keep consistency
   */
  postCreate() {
    const id: string = this.route.snapshot.params["id"];
    if (!id) {
      const { table_key, table_name } =
        this.route.snapshot.queryParamMap.keys.reduce(
          (acc, key) => {
            acc[key] = this.route.snapshot.queryParamMap.get(key);
            return acc;
          },
          {} as Record<string, string | null>,
        );
      if (table_key) this.element.table_key = table_key;
      if (table_name) this.element.table_name = table_name;
      if(table_key && table_name) {
        this.documentService.getDocumentsByTable(table_name, table_key).subscribe(
          (documents) => {
            this.galleryImages = documents;
          }
        );
      } 
    }
  }

  uploadFiles(): void {
    this.displayProgressBar = true;

    if (!this.fileUploader) {
      this.displayProgressBar = false;
      return;
    }

    if (this.fileUploader && this.fileUploader.files.length > 0) {
      const queries: any = {};
      for (let file of this.fileUploader.files) {
        const formData = new FormData();
        formData.append("filename", file.name);
        formData.append("table_name", this.element.table_name);
        formData.append("table_key", this.element.table_key);
        if (file.type) {
          formData.append("mimeType", file.type);
        } else {
          formData.append("mimeType", "application/octet-stream");
        }
        formData.append("file", file);
        queries[file.name] = this.documentService
          .uploadFile(this.element, formData)
          .pipe(
            catchError(() => {
              return of(null);
            }),
          );
      }
      forkJoin(queries).subscribe(
        (queriesResponse) => {
          this.addInfo("File caricato con successo");
          this.displayProgressBar = false;

          if (this.element.uuid) {
            // sto modificando quindi ho già l'uuid
            this.navigateAfterUpdate();
          } else {
            // sto creando e l'endpoint di upload lancia un evento async, non conosce l'uuid dell'attachment creato
            // riporto l'utente alla lista
            this.handleBackNavigation();
          }
        },
        (error) => {
          this.addError("Errore caricamento file," + error);
          this.displayProgressBar = false;
        },
      );
    } else {
      this.displayProgressBar = false;
    }
  }

  /**
   * When table_key or table_name query params are provided
   * handles redirect to previous location instead of list
   */
  handleBackNavigation() {
    if (
      this.route.snapshot.queryParamMap.has("table_key") ||
      this.route.snapshot.queryParamMap.has("table_name")
    ) {
      this.location.back();
    } else {
      this.navigateToList();
    }
  }
}
