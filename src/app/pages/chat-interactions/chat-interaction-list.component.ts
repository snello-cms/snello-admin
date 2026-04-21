import {Component, OnInit} from '@angular/core';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Router} from '@angular/router';
import {ChatInteraction} from '../../models/chat-interaction';
import {ChatInteractionService} from '../../services/chat-interaction.service';
import {ConfirmationService, MessageService, PrimeTemplate} from 'primeng/api';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {TableModule} from 'primeng/table';

@Component({
    standalone: true,
    templateUrl: './chat-interaction-list.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, TableModule, PrimeTemplate]
})
export class ChatInteractionListComponent extends AbstractListComponent<ChatInteraction> implements OnInit {

  constructor(
    public router: Router,
    public confirmationService: ConfirmationService,
    public service: ChatInteractionService,
    public messageService: MessageService
  ) {
    super(messageService, router, confirmationService, service, 'chatinteractions');
    this.filters = new ChatInteraction();
  }

  ngOnInit() {
    this.service.buildSearch();
    this.firstReload = true;
  }
}
