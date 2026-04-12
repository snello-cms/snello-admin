import {Component, DestroyRef, OnInit, inject} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {MessageService, ToastMessageOptions} from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Message } from 'primeng/message';
import { RouterOutlet } from '@angular/router';

@Component({
    standalone: true,
    templateUrl: './outlet.component.html',
    styleUrls: ['./outlet.component.scss'],
    imports: [ConfirmDialog, Message, RouterOutlet]
})
export class OutletComponent implements OnInit {

    messages: ToastMessageOptions[] = [];
    private messageService = inject(MessageService);
    private destroyRef = inject(DestroyRef);

    ngOnInit() {
        this.messageService.messageObserver.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((message) => {
            if (Array.isArray(message)) {
                this.messages = [...this.messages, ...message];
            } else {
                this.messages = [...this.messages, message];
            }
        });

        this.messageService.clearObserver.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.messages = [];
        });
    }

    removeMessage(index: number) {
        this.messages = this.messages.filter((_, i) => i !== index);
    }

}
