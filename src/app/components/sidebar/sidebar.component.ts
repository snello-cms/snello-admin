import {Component, HostListener, inject} from '@angular/core';
import {APP_VERSION, ASSET_PATH} from '../../constants/constants';
import { Router, RouterLink } from '@angular/router';
import {ConfigurationService} from '../../service/configuration.service';
import Keycloak from 'keycloak-js';
import { PermitDirective } from '../../directives/permit.directive';
import { AuthenticationService } from '../../service/authentication.service';

@Component({
    selector: 'sidebar',
    templateUrl: './sidebar.component.html',
    imports: [RouterLink, PermitDirective],
    styles: [
        `.account-link {
            cursor: pointer;
            display: inline-block;
            min-width: 60px;
            text-align: center;
        }

        .account-link .fa-user-circle {
            margin: 0;
        }

        .account-popup {
            position: absolute;
            right: 0;
            top: calc(100% + 8px);
            min-width: 260px;
            background: #ffffff;
            color: #222222;
            border: 1px solid #d7d7d7;
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
            padding: 12px;
            z-index: 999;
            text-align: left;
        }

        .account-menu-item {
            position: relative;
            z-index: 3;
        }

        .account-row {
            margin-bottom: 6px;
            font-size: 13px;
        }

        .account-section-title {
            margin: 10px 0 6px;
            font-weight: 700;
            font-size: 12px;
            text-transform: uppercase;
            color: #666666;
        }

        .account-roles-list {
            margin: 0;
            padding-left: 16px;
            max-height: 120px;
            overflow: auto;
        }

        .account-roles-list li {
            font-size: 12px;
            line-height: 1.4;
            margin-bottom: 2px;
        }

        .account-logout {
            display: inline-block;
            margin-top: 10px;
            cursor: pointer;
        }
    `]
})
export class SideBarComponent {
    private readonly keycloak = inject(Keycloak);
    private readonly configurationService = inject(ConfigurationService);
    protected readonly router = inject(Router);
    readonly authService = inject(AuthenticationService);

    public selected = 'home';
    public asset_path: string;
    public accountMenuOpen = false;

    constructor() {
        this.configurationService.getValue(ASSET_PATH).subscribe({
            next: ass => {
                this.asset_path = ass;
            }
        });
    }

    async logout() {
        await this.keycloak.logout();
    }

    toggleAccountMenu() {
        this.accountMenuOpen = !this.accountMenuOpen;
    }

    closeAccountMenu() {
        this.accountMenuOpen = false;
    }

    @HostListener('document:click')
    onDocumentClick() {
        this.closeAccountMenu();
    }

    @HostListener('document:keydown.escape')
    onEscape() {
        this.closeAccountMenu();
    }

    public select(page: string) {
        this.selected = page;
    }


    version(): string {
        return APP_VERSION;
    }

    isContenPage() {
        const lastIndexOfSlash = this.router.url.indexOf('home')
            || this.router.url.indexOf('datalist')

        ;
        if (lastIndexOfSlash >= 0) {
            return 'active';
        } else {
            return '';
        }
    }

    isAdminPage() {
        const lastIndexOfSlash = this.router.url.indexOf('adminpage')
            || this.router.url.indexOf('metadata')
            || this.router.url.indexOf('fielddefinition')
            || this.router.url.indexOf('condition')
            || this.router.url.indexOf('document')
            || this.router.url.indexOf('publicdata')
            || this.router.url.indexOf('selectqueries')
            || this.router.url.indexOf('user')
            || this.router.url.indexOf('role')
            || this.router.url.indexOf('urlmaprules')
            || this.router.url.indexOf('link');
        if (lastIndexOfSlash >= 0) {
            return 'active';
        } else {
            return '';
        }
    }

}
