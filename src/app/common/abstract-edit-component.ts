import {AbstractService} from './abstract-service';
import {Router, ActivatedRoute} from '@angular/router';
import { ChangeDetectorRef, DestroyRef, OnInit, Directive, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {ConfirmationService, MessageService} from 'primeng/api';

@Directive()
export abstract class AbstractEditComponent<T> implements OnInit {

    public editMode = false;
    public element!: T;
    protected readonly destroyRef = inject(DestroyRef);

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        public confirmationService: ConfirmationService,
        public service: AbstractService<T>,
        public messageService: MessageService,
        public path?: string,
        protected cdr?: ChangeDetectorRef
    ) {
    }

    ngOnInit() {
        const id: string = this.route.snapshot.params['id'];
        if (id) {
            this.editMode = true;
            this.service.find(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
                element => {
                    this.element = <T>element;
                    this.postFind();
                    this.cdr?.detectChanges();
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
        this.service.persist(this.element).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
            element => {
                this.addInfo('Save completed successfully.');
                this.element = <T>element;
                this.postSave();
                this.navigateAfterSave();
            },
            error => {
                this.addError(
                    'Unable to complete the save. ' + (error || '')
                );
                this.saveError();
            }
        );
    }

    saveError() {
    }

    update() {
        this.clearMsgs();
        this.editMode = false;
        if (!this.preUpdate()) {
            return;
        }
        this.service.update(this.element).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
            element => {
                this.addInfo('Update completed successfully.');
                this.element = <T>element;
                this.postUpdate();
                this.navigateAfterUpdate();
            },
            error => {
                this.addError('Unable to complete the update. ' + (error || ''));
                this.saveError();
            }
        );
    }

    delete() {
        this.clearMsgs();
        this.editMode = false;
        this.service.delete(this.getId()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
            element => {
                this.postDelete();
                this.navigateAfterDelete();
                this.addInfo('Deletion completed successfully.');
            },
            error => {
                this.addError(
                    'Unable to complete the deletion. ' + (error || '')
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
            summary: 'Info: ',
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
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            acceptButtonProps: {
                severity: 'danger',
                outlined: false
            },
            rejectButtonProps: {
                severity: 'secondary',
                outlined: true
            },
            accept: () => {
                this.delete();
            }
        });
    }

    getId(): string {
        return String((this.element as unknown as { uuid: unknown }).uuid);
    }
}
