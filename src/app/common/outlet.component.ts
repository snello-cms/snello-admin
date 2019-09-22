import {Component, OnInit} from '@angular/core';
import {MessageService} from 'primeng/api';

@Component({
    templateUrl: './outlet.component.html'
})
export class OutletComponent implements OnInit {


    constructor(messageService: MessageService) {
    }

    ngOnInit() {
    }

}
