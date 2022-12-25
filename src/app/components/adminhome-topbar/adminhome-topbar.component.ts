import {Component} from '@angular/core';
import {ADMIN_ITEMS} from '../../constants/constants';

@Component({
    selector: 'adminhome-topbar',
    templateUrl: './adminhome-topbar.component.html'
})
export class AdminhomeTopBar {

    items: any[] = [];
    constructor() {
        this.items = ADMIN_ITEMS;
    }

}
