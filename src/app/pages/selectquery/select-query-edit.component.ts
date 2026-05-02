import {Component, OnInit, inject} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationService, MessageService} from 'primeng/api';
import {SelectQueryService} from "../../services/select-query.service";
import {SelectQuery} from "../../models/select-query";
import { SideBarComponent } from '../sidebar/sidebar.component';
import { AdminhomeTopBar } from '../adminhome-topbar/adminhome-topbar.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
    standalone: true,
    templateUrl: './select-query-edit.component.html',
  imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, ToggleSwitchModule]
})
export class SelectQueryEditComponent extends AbstractEditComponent<SelectQuery>
  implements OnInit {

  constructor() {
    super(inject(Router), inject(ActivatedRoute), inject(ConfirmationService), inject(SelectQueryService), inject(MessageService), 'selectqueries');
  }

  createInstance(): SelectQuery {
    return new SelectQuery();
  }

  ngOnInit() {
    this.element = new SelectQuery();
    super.ngOnInit();
  }


}
