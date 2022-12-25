import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ADMIN_ITEMS, APP_VERSION, SEVERITY_VALUES} from '../../constants/constants';
import {MessageService} from 'primeng/api';
import {KeycloakService} from 'keycloak-angular';
import {KeycloakProfile} from 'keycloak-js';

@Component(
    {
        templateUrl: './adminpage.component.html'
    }
)
export class AdminpageComponent {

    items: any[] = [];
    severity: string;
    severityValues = SEVERITY_VALUES;
    userDetails: KeycloakProfile;
    roles: string[];

    constructor(private _route: ActivatedRoute,
                public router: Router,
                private keycloakService: KeycloakService,
                private messageService: MessageService) {
        this.items = ADMIN_ITEMS;
        this.refreshKeycloak();
    }

    async refreshKeycloak() {
        if (await this.keycloakService.isLoggedIn()) {
            this.userDetails = await this.keycloakService.loadUserProfile();
            this.roles = this.keycloakService.getUserRoles();
        }
    }

    showViaService() {
        this.messageService.add({severity: this.severity, summary: 'Service Message', detail: 'Via MessageService'});
    }

    public version(): string {
        return APP_VERSION;
    }
}
