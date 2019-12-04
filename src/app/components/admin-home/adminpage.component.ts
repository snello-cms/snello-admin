import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../../service/authentication.service';
import {UserInSession} from '../../model/user-in-session';
import {ADMIN_ITEMS, APP_VERSION, SEVERITY_VALUES} from '../../constants/constants';
import {MessageService} from 'primeng/api';

@Component(
    {
        templateUrl: './adminpage.component.html',
        styleUrls: ['./adminpage.component.css']
    }
)
export class AdminpageComponent {

    items: any[] = [];
    public utente: UserInSession;
    severity: string;
    severityValues = SEVERITY_VALUES;


    constructor(private _route: ActivatedRoute,
                public router: Router,
                private authenticationService: AuthenticationService,
                private messageService: MessageService) {
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
        this.items = ADMIN_ITEMS;
    }

    showViaService() {
        this.messageService.add({severity: this.severity, summary: 'Service Message', detail: 'Via MessageService'});
    }

    public version(): string {
        return APP_VERSION;
    }
}
