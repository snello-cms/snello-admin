import {Component, DestroyRef, HostListener, inject} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {APP_VERSION, ASSET_PATH} from '../../constants/constants';
import { Router, RouterLink } from '@angular/router';
import {ConfigurationService} from '../../services/configuration.service';
import Keycloak from 'keycloak-js';
import { PermitDirective } from '../../directives/permit.directive';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
    selector: 'sidebar',
    standalone: true,
    templateUrl: './sidebar.component.html',
    imports: [RouterLink, PermitDirective],
    styles: [
        `.user-menu {
            position: absolute;
            right: 20px;
            top: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 0;
            padding: 0;
        }

        .user-menu li {
            list-style-type: none;
        }

        .account-link {
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            min-width: 36px;
            text-align: center;
            border-radius: 50%;
            color: #666666;
        }

        .account-link:hover,
        .account-link.active,
        .account-logout-inline:hover {
            color: #222222;
            text-decoration: none;
        }

        .account-link .fa-user-circle {
            margin: 0;
            font-size: 24px;
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
            z-index: 2000;
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

        .account-logout-inline {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            color: #666666;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
        }

        .account-logout-inline .fa-sign-out {
            font-size: 18px;
            line-height: 1;
        }

        .header .nav-tabs > li > a {
            display: inline-flex;
            align-items: center;
        }

        .header .nav-tabs > li > a i {
            margin-right: 8px;
        }

        @media (max-width: 1024px) {
            .header .nav-tabs > li > a {
                font-size: 0;
                margin: 0 6px;
                min-width: 36px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }

            .header .nav-tabs > li > a i {
                font-size: 18px;
                margin: 0;
            }

            .header .nav-tabs > li > a .nav-text {
                display: none;
            }

            .account-logout-inline .logout-text {
                display: none;
            }

            .user-menu {
                right: 10px;
                gap: 8px;
            }

            .account-logout-inline {
                width: 36px;
                height: 36px;
                justify-content: center;
            }
        }
    `]
})
export class SideBarComponent {
    private readonly keycloak = inject(Keycloak);
    private readonly configurationService = inject(ConfigurationService);
    protected readonly router = inject(Router);
    readonly authService = inject(AuthenticationService);
    private readonly destroyRef = inject(DestroyRef);

    public selected = 'home';
    public asset_path: string;
    public accountMenuOpen = false;

    constructor() {
        this.configurationService.getValue(ASSET_PATH).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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

    resolveAssetUrl(relativePath: string): string {
        const path = relativePath.replace(/^\/+/, '');
        const basePath = (this.asset_path ?? '').trim();

        if (!basePath) {
            return path;
        }

        const normalizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
        return `${normalizedBase}/${path}`;
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
            || this.router.url.indexOf('aitools')
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
