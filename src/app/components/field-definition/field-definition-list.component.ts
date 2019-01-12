import {AbstractListComponent} from "../../common/abstract-list-component";
import {Component, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {MatPaginator, MatTableDataSource} from "@angular/material";
import {FieldDefinitionService} from "../../service/field-definition.service";
import {FieldDefinition} from "../../model/field-definition";

@Component(
  {
    templateUrl: "./field-definition-list.component.html",
    styleUrls: ["./field-definition-list.component.css"]
  }
)
export class FieldDefinitionListComponent extends AbstractListComponent<FieldDefinition> {

  displayedColumns: string[] = ['metadata_name', 'table_key', 'label', 'name', 'inputType', 'group', 'tab', 'sql_type', 'pattern', 'operations'];
  dataSource = new MatTableDataSource<FieldDefinition>();

  @ViewChild(MatPaginator) paginator: MatPaginator;


  constructor(
    protected router: Router,
    protected service: FieldDefinitionService) {

    super(router, service, 'fielddefinition');
    this.filters = new FieldDefinition();
    this.dataSource.paginator = this.paginator;
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
    this.dataSource = new MatTableDataSource<FieldDefinition>(this.model);
    super.postList();
  }
}
