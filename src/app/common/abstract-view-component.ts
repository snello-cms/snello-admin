import {AbstractService} from './abstract-service';
import {ActivatedRoute, Router} from '@angular/router';
import {OnInit} from '@angular/core';
import {MessageService} from "primeng/api";

export abstract class AbstractViewComponent<T> implements OnInit {

    // public msgs:Message[] = [];

    public editMode = false;
    public element: T = null;

    constructor(protected router: Router,
                protected route: ActivatedRoute,
                protected service: AbstractService<T>,
                protected messageService: MessageService,
                public path?: string) {
    }

    ngOnInit() {
        const id: string = this.route.snapshot.params['id'];
        if (id) {
            this.editMode = true;
            this.service.find(id).subscribe(
                element => {
                    this.element = <T>element;
                    this.postFind();
                },
                error => {
                    this.addError('Error while loading data' + (error || ''));
                }
            );
        } else {
            this.addError('Error while loading data');
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

    public addInfo(message: string) {
        this.messageService.add({
            severity: 'info',
            summary: 'Informazioni: ',
            detail: message
        });
    }

    public addWarn(message: string) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Attenzione: ',
            detail: message
        });
    }

    public addError(message: string) {
        this.messageService.add({severity: 'error', summary: 'Error: ', detail: message});
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
        if (lastIndexOfSlash >= 0) {
            backPath = this.path.substring(0, lastIndexOfSlash + 1);
            if (backPath === '') {
                backPath = 'home';
            }
        }
        this.router.navigate(['/' + backPath]);
    }

}
