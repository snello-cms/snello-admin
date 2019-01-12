import {AbstractListComponent} from '../../common/abstract-list-component';
import {Component, ViewChild} from '@angular/core';
import {Metadata} from '../../model/metadata';
import {Router} from '@angular/router';
import {MetadataService} from '../../service/metadata.service';
import {MatPaginator, MatTableDataSource} from '@angular/material';

@Component(
  {
    templateUrl: './metadata-list.component.html',
    styleUrls: ['./metadata-list.component.css']
  }
)
export class MetadataListComponent extends AbstractListComponent<Metadata> {

  displayedColumns: string[] = ['table_name', 'description', 'table_key', 'order_by', 'alias_table', 'operations'];
  dataSource = new MatTableDataSource<Metadata>();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
      router: Router,
      public service: MetadataService) {

    super(router, service, 'metadata');
    this.filters = new Metadata();
    this.dataSource.paginator = this.paginator;
  }


  postList() {
    this.dataSource = new MatTableDataSource<Metadata>(this.model);
    super.postList();
  }

  ngOnInit() {
    this.service.buildSearch();
    this.firstReload = true;
    this.loaddata(true, null);
  }

  public new() {
    this.router.navigate(['/' + this.path + '/new']);
  }

  public createTable(metadata: Metadata) {
    (<MetadataService>this.service).createTable(metadata).subscribe(
      element => {
        console.log('table created: ' + element);
      });
  }

}
