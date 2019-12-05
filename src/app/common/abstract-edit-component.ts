import {AbstractService} from './abstract-service';
import {Router, ActivatedRoute} from '@angular/router';
import {OnInit} from '@angular/core';
import {ConfirmationService, MessageService} from 'primeng/api';

export abstract class AbstractEditComponent<T> implements OnInit {

    public editMode = false;
    public element: T = null;

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        public confirmationService: ConfirmationService,
        public service: AbstractService<T>,
        public messageService: MessageService,
        public path?: string,
    ) {
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
            this.editMode = false;
            this.element = this.createInstance();
            this.postCreate();
        }
    }

    postCreate() {
    }

    postFind() {
    }

    preSave(): boolean {
        return true;
    }

    preUpdate(): boolean {
        return true;
    }

    postSave() {
    }

    postUpdate() {
    }

    postDelete() {
    }

    save() {
        this.clearMsgs();
        this.editMode = false;
        if (!this.preSave()) {
            return;
        }
        this.service.persist(this.element).subscribe(
            element => {
                this.addInfo('Salvataggio completato con successo. ');
                this.element = <T>element;
                this.postSave();
                this.navigateAfterSave();
            },
            error => {
                this.addError(
                    'Impossibile completare il salvataggio. ' + (error || '')
                );
                this.saveError();
            }
        );
    }

    saveError() {
    }

    update() {
        console.log(JSON.stringify(this.element));
        this.clearMsgs();
        this.editMode = false;
        if (!this.preUpdate()) {
            return;
        }
        this.service.update(this.element).subscribe(
            element => {
                this.addInfo('Modify completata con successo. ');
                this.element = <T>element;
                this.postUpdate();
                this.navigateAfterUpdate();
            },
            error => {
                this.addError('Impossibile completare la Modify. ' + (error || ''));
                this.saveError();
            }
        );
    }

    delete() {
        this.clearMsgs();
        this.editMode = false;
        this.service.delete(this.getId()).subscribe(
            element => {
                this.postDelete();
                this.navigateAfterDelete();
                this.addInfo('Eliminazione completata con successo. ');
            },
            error => {
                this.addError(
                    'Impossibile completare la eliminazione. ' + (error || '')
                );
            }
        );
    }

    goToList() {
        this.clearMsgs();
        this.navigateToList();
    }

    public isEditMode(): boolean {
        return this.editMode;
    }

    public clearMsgs() {
        // this.msgs = [];
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

    abstract createInstance(): T;

    navigateAfterDelete() {
        if (this.path) {
            this.router.navigate(['/' + this.path + '/list']);
        } else {
            this.router.navigate(['/']);
        }
    }

    navigateAfterSave() {
        if (this.path) {
            this.router.navigate(['/' + this.path + '/list']);
        } else {
            this.router.navigate(['/']);
        }
    }

    navigateAfterUpdate() {
        if (this.path) {
            this.router.navigate(['/' + this.path + '/list']);
        } else {
            this.router.navigate(['/']);
        }
    }

    navigateToList() {
        if (this.path) {
            this.router.navigate(['/' + this.path + '/list']);
        } else {
            this.router.navigate(['/']);
        }
    }

    public confirmDelete() {
        this.clearMsgs();
        if (!this.confirmationService) {
            return this.delete();
        }
        this.confirmationService.confirm({
            message: 'Do you really want to delete this record?',
            accept: () => {
                this.delete();
            }
        });
    }

    getId() {
        return this.element['uuid'];
    }
}
