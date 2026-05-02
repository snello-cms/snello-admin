import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Component, OnInit, inject} from '@angular/core';
import {Router} from '@angular/router';
import {SelectQueryService} from '../../services/select-query.service';
import {SelectQuery} from '../../models/select-query';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { AdminhomeTopBar } from '../adminhome-topbar/adminhome-topbar.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

@Component({
    standalone: true,
    templateUrl: './select-query-list.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, TableModule, PrimeTemplate]
})
export class SelectQueryListComponent extends AbstractListComponent<SelectQuery> implements OnInit {




  constructor() {
      super(inject(MessageService), inject(Router), inject(ConfirmationService), inject(SelectQueryService), 'selectqueries');
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
