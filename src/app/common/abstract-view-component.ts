import {AbstractService} from "./abstract-service";
import {Router, ActivatedRoute} from "@angular/router";
import {OnInit} from "@angular/core";

export abstract class AbstractViewComponent<T> implements OnInit {

    //public msgs:Message[] = [];

    public editMode: boolean = false;
    public element:T = null;

    constructor(protected router:Router,
                protected route:ActivatedRoute,
                protected service:AbstractService<T>,
                public path?: string) {
    }

    ngOnInit() {
        let id:string = this.route.snapshot.params['id'];
        if (id) {
            this.editMode = true;
            this.service.find(id).subscribe(
                element => {
                    this.element = <T>element;
                    this.postFind();
                },
                error => {
                    this.addError('Errore nel caricamento dei dati.' + ( error || ''));
                }
            );
        } else {
            this.addError("Errore nel caricamento dei dati.");
        }
    }

    postFind() {
    }

    goToList() {
        this.clearMsgs();
        this.navigateToList();
    }

    public clearMsgs() {
      //this.msgs = [];
    }

    public addInfo(message:string) {
      //    this.msgs.push({severity: 'info', summary: 'Informazioni: ', detail: message});
    }

    public addWarn(message:string) {
      //this.msgs.push({severity: 'warn', summary: 'Attenzione: ', detail: message});
    }

    public addError(message:string) {
      //this.msgs.push({severity: 'error', summary: 'Errore: ', detail: message});
    }

    abstract getId();

    navigateToList() {
        this.router.navigate(['/' + this.path + '/list']);
    }

    public edit(element: T) {
        this.element = element;
        this.router.navigate(['/' + this.path + '/edit', this.getId()]);
    }

    annulla() {
        let backPath = this.path;
        const lastIndexOfSlash = this.path.lastIndexOf('/');
        if ( lastIndexOfSlash >= 0 ) {
            backPath = this.path.substring(0, lastIndexOfSlash + 1);
            if ( backPath === '' ) {
                backPath = 'home';
            }
        }
        this.router.navigate(['/' + backPath]);
    }

}
