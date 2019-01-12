import {Component} from "@angular/core";
import {AbstractEditComponent} from "../../common/abstract-edit-component";
import {ActivatedRoute, Router} from "@angular/router";
import {Condition} from "../../model/condtion";
import {ConditionService} from "../../service/condition.service";
import {MetadataService} from "../../service/metadata.service";
import {Metadata} from "../../model/metadata";

@Component(
  {
    templateUrl: "./condition-edit.component.html",
    styleUrls: ["./condition-edit.component.css"]
  }
)
export class ConditionEditComponent extends AbstractEditComponent<Condition> {

  metadatas = [];


  constructor(
    router: Router,
    route: ActivatedRoute,
    conditionService: ConditionService,
    private metadataService: MetadataService
  ) {
    super(router, route, conditionService, 'condition');

  }

  ngOnInit() {
    this.element = new Condition();
    this.metadatas = [];
    this.metadataService.getList().subscribe(
      metadataList => {
        this.metadatas = metadataList;
      }
    );
    super.ngOnInit();
  }

  createInstance(): Condition {
    return new Condition();
  }

  setName(event: any, metadata: Metadata) {
    this.element.metadata_name = metadata.table_name;
  }


}

