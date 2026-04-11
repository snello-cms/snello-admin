import {Component, inject} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {ADMIN_ITEMS, SEVERITY_VALUES} from '../../constants/constants';
import {MessageService} from 'primeng/api';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { AdminhomeTopBar } from '../adminhome-topbar/adminhome-topbar.component';
import { PermitDirective } from '../../directives/permit.directive';
import { AuthenticationService } from '../../service/authentication.service';

@Component({
    templateUrl: './adminpage.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, PermitDirective, RouterLink]
})
export class AdminpageComponent {
    private readonly route = inject(ActivatedRoute);
    readonly router = inject(Router);
    private readonly messageService = inject(MessageService);
    readonly authService = inject(AuthenticationService);

    items: any[] = [];
    severity: string;
    severityValues = SEVERITY_VALUES;

    constructor() {
        void this.route;
        this.items = ADMIN_ITEMS;
    }

    showViaService() {
        this.messageService.add({severity: this.severity, summary: 'Service Message', detail: 'Via MessageService'});
    }
}
