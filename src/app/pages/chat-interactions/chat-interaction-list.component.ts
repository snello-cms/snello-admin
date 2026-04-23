import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
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
import {DialogModule} from 'primeng/dialog';
import {CopyClipboardDirective} from '../../directives/copy-clipboard.directive';

@Component({
    standalone: true,
    templateUrl: './chat-interaction-list.component.html',
    imports: [CommonModule, SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, TableModule, PrimeTemplate, DialogModule, CopyClipboardDirective]
})
export class ChatInteractionListComponent extends AbstractListComponent<ChatInteraction> implements OnInit {
  readonly previewMaxLength = 100;
  previewDialogVisible = false;
  previewDialogTitle = '';
  previewDialogContent = '';

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

  previewText(value?: string): string {
    if (!value) {
      return '';
    }

    const trimmed = value.trim();
    if (trimmed.length <= this.previewMaxLength) {
      return trimmed;
    }

    return `${trimmed.slice(0, this.previewMaxLength)}...`;
  }

  hasMoreText(value?: string): boolean {
    return !!value && value.trim().length > this.previewMaxLength;
  }

  openPreview(title: string, content?: string): void {
    this.previewDialogTitle = title;
    this.previewDialogContent = content?.trim() || '';
    this.previewDialogVisible = true;
  }

  closePreview(): void {
    this.previewDialogVisible = false;
    this.previewDialogTitle = '';
    this.previewDialogContent = '';
  }

  formatCreationDate(value?: string): string {
    if (!value) {
      return '-';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('it-IT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(parsed);
  }

  applyQuickFilter(field: 'conversation_uuid' | 'user_id', value: string, datatable: any): void {
    if (!value || !this.service.search) {
      return;
    }

    this.service.search[field] = value;
    this.reload(datatable);
  }

  onValueCopied(label: string): void {
    this.addInfo(`${label} copied to clipboard.`);
  }
}
