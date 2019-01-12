import {Component} from "@angular/core";
import {AbstractEditComponent} from "../../common/abstract-edit-component";
import {Metadata} from "../../model/metadata";
import {ActivatedRoute, Router} from "@angular/router";
import {MetadataService} from "../../service/metadata.service";
import {SelectItem} from "primeng/api";

@Component (
  {
    templateUrl: "./metadata-edit.component.html",
    styleUrls: ["./metadata-edit.component.css"]
  }
)
export class MetadataEditComponent extends AbstractEditComponent<Metadata> {

  tableTypeSelect: SelectItem[] = [
    {value: "uuid",label: "uuid"},
    {value: "slug",label:"slug"},
    {value: "autoincrement",label:"auto increment"}
  ];

  constructor(
    router: Router,
    route: ActivatedRoute,
    metadataService: MetadataService,
  ) {
    super(router, route, metadataService, 'metadata');

  }

  createInstance(): Metadata {
    return new Metadata();
  }


  ngOnInit() {
    this.element = new Metadata();
    super.ngOnInit();
  }
}

