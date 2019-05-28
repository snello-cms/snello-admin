import {Component, OnInit} from '@angular/core';
import { Message } from 'primeng/api';

@Component({
    templateUrl: './outlet.component.html'
})
export class OutletComponent implements OnInit {

  public msgs: Message[] = [];

    constructor() {
    }

    ngOnInit() {
    }

}
