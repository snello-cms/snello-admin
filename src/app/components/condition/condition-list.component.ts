import {AbstractListComponent} from "../../common/abstract-list-component";
import {Component, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {Condition} from "../../model/condtion";
import {ConditionService} from "../../service/condition.service";

@Component(
  {
    templateUrl: "./condition-list.component.html",
    styleUrls: ["./condition-list.component.css"]
  }
)
export class ConditionListComponent extends AbstractListComponent<Condition> {


  uuid: string;
  metadata_uuid: string;
  separator: string;
  condition: string;
  sub_query: string;

  constructor(
    protected router: Router,
    protected service: ConditionService) {

    super(router, service, 'condition');
    this.filters = new Condition();
  }

  ngOnInit() {
    this.service.buildSearch();
    this.firstReload = true;
    this.loaddata(true, null);
  }

  public new() {
    this.router.navigate(['/' + this.path + '/new']);
  }

  postList() {
    super.postList();
  }
}
