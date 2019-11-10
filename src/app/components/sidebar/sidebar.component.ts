import {Component} from '@angular/core';
import {APP_VERSION, ASSET_PATH} from '../../constants/constants';
import {AuthenticationService} from '../../service/authentication.service';
import {Router} from '@angular/router';
import {ConfigurationService} from '../../service/configuration.service';
import {UserInSession} from '../../model/user-in-session';

@Component({
    selector: 'sidebar',
    templateUrl: './sidebar.component.html'
})
export class SideBarComponent {
    public selected = 'home';
    public asset_path: string;
    public utente: UserInSession;

    constructor(private authenticationService: AuthenticationService,
                private configurationService: ConfigurationService,
                protected router: Router) {
        configurationService.getValue(ASSET_PATH).subscribe(
            ass => this.asset_path = ass
        );
        this.utente = new UserInSession();
        this.authenticationService.getUtente().subscribe(
            utente => {
                if (utente) {
                    console.log('utente: ' + utente.username);
                    this.utente = utente;
                } else {
                    this.utente.username = 'sconosciuto';
                }
            });
    }

    logout() {
        this.authenticationService.logout();
        this.router.navigate(['/login']);
    }

    public select(page: string) {
        this.selected = page;
    }

    public edit() {
        this.router.navigate(['/user/yourself', this.utente.username]);
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
