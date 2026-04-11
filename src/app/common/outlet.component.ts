import {Component, OnDestroy, OnInit} from '@angular/core';
import {MessageService} from 'primeng/api';
import { ToastMessageOptions } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Message } from 'primeng/message';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    templateUrl: './outlet.component.html',
    styleUrls: ['./outlet.component.scss'],
    imports: [ConfirmDialog, Message, RouterOutlet]
})
export class OutletComponent implements OnInit, OnDestroy {

    messages: ToastMessageOptions[] = [];
    private messageSubscription?: Subscription;
    private clearSubscription?: Subscription;

    constructor(private messageService: MessageService) {
    }

    ngOnInit() {
        this.messageSubscription = this.messageService.messageObserver.subscribe((message) => {
            if (Array.isArray(message)) {
                this.messages = [...this.messages, ...message];
            } else {
                this.messages = [...this.messages, message];
            }
        });

        this.clearSubscription = this.messageService.clearObserver.subscribe(() => {
            this.messages = [];
        });
    }

    removeMessage(index: number) {
        this.messages = this.messages.filter((_, i) => i !== index);
    }

    ngOnDestroy() {
        this.messageSubscription?.unsubscribe();
        this.clearSubscription?.unsubscribe();
    }

}
