import {Component, OnInit} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationService} from 'primeng/api';
import {SelectQueryService} from "../../service/select-query.service";
import {SelectQuery} from "../../model/select-query";

@Component({
  templateUrl: './select-query-edit.component.html',
  styleUrls: ['./select-query-edit.component.css']
})
export class SelectQueryEditComponent extends AbstractEditComponent<SelectQuery>
  implements OnInit {

  constructor(
    router: Router,
    route: ActivatedRoute,
    confirmationService: ConfirmationService,
    selectQueryService: SelectQueryService
  ) {
    super(router, route, confirmationService, selectQueryService, 'selectqueries');
  }

  createInstance(): SelectQuery {
    return new SelectQuery();
  }

  ngOnInit() {
    this.element = new SelectQuery();
    super.ngOnInit();
  }


}
