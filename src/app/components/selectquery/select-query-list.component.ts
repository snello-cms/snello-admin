import {ConfirmationService, MessageService} from 'primeng/api';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {SelectQueryService} from '../../service/select-query.service';
import {SelectQuery} from '../../model/select-query';

@Component(
  {
    templateUrl: './select-query-list.component.html',
    styleUrls: ['./select-query-list.component.css']
  }
)
export class SelectQueryListComponent extends AbstractListComponent<SelectQuery> implements OnInit {




  constructor(
      public  router: Router,
      public confirmationService: ConfirmationService,
      public service: SelectQueryService,
      public messageService: MessageService) {

    super(messageService, router, confirmationService, service, 'selectqueries');
    this.filters = new SelectQuery();
  }


  postList() {
   super.postList();
  }

  ngOnInit() {
    this.service.buildSearch();
    this.firstReload = true;
  }

  public new() {
    this.router.navigate(['/' + this.path + '/new']);
  }

}
