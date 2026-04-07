import {Component, OnInit} from '@angular/core';
import {MessageService} from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { MessagesModule } from 'primeng/messages';
import { RouterOutlet } from '@angular/router';

@Component({
    templateUrl: './outlet.component.html',
    imports: [ConfirmDialog, MessagesModule, RouterOutlet]
})
export class OutletComponent implements OnInit {


    constructor(messageService: MessageService) {
    }

    ngOnInit() {
    }

}
