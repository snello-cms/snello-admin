import {Component, OnInit} from '@angular/core';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Router} from '@angular/router';
import {Condition} from '../../model/condtion';
import {ConditionService} from '../../service/condition.service';
import {MetadataService} from '../../service/metadata.service';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';

@Component(
  {
    templateUrl: './condition-list.component.html',
  }
)
export class ConditionListComponent extends AbstractListComponent<Condition> implements OnInit {


  public uuid: string;
  public metadata_uuid: string;
  public separator: string;
  public condition: string;
  public sub_query: string;

  public metadatasItems: SelectItem[];


  constructor(
      public router: Router,
      public confirmationService: ConfirmationService,
      public service: ConditionService,
      public metadataService: MetadataService,
      public messageService: MessageService) {

    super(messageService, router, confirmationService, service, 'condition');
    this.filters = new Condition();
    this.metadatasItems = [];
    this.metadataService.buildSearch();
    this.metadataService.getAllList().subscribe(metadatas => {
      this.metadatasItems.push({label: null, value: '...'});
      for (let p = 0; p < metadatas.length; p++) {
        this.metadatasItems.push({
          label: metadatas[p].table_name,
          value: metadatas[p].uuid
        });
      }
    });
  }

  ngOnInit() {
    this.service.buildSearch();
    this.firstReload = true;
  }

  public new() {
    this.router.navigate(['/' + this.path + '/new']);
  }

  postList() {
    super.postList();
  }
}

