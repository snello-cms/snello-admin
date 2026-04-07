import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {SelectQueryService} from '../../service/select-query.service';
import {SelectQuery} from '../../model/select-query';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { AdminhomeTopBar } from '../adminhome-topbar/adminhome-topbar.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

@Component({
    templateUrl: './select-query-list.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, TableModule, PrimeTemplate]
})
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
