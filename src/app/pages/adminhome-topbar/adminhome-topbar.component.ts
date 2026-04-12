import {Component} from '@angular/core';
import {ADMIN_ITEMS} from '../../constants/constants';
import { RouterLink } from '@angular/router';
import { PermitDirective } from '../../directives/permit.directive';

@Component({
    selector: 'adminhome-topbar',
    standalone: true,
    templateUrl: './adminhome-topbar.component.html',
    imports: [RouterLink, PermitDirective]
})
export class AdminhomeTopBar {

    items: any[] = [];
    constructor() {
        this.items = ADMIN_ITEMS;
    }

}
