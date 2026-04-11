import {ConfirmationService, MessageService} from 'primeng/api';
import {AbstractService} from './abstract-service';
import {Router} from '@angular/router';
import { ChangeDetectorRef, OnInit, Directive } from '@angular/core';
import {DocumentService} from '../service/document.service';

@Directive()
export abstract class AbstractListComponent<T> implements OnInit {

    element!: T;
    errorMessage: string;
    model: T[] = [];
    listSize: number;
    public colspan = 3;

    public lang_it = {
        closeText: 'Close',
        prevText: '&#x3C;Prev',
        nextText: 'Next&#x3E;',
        currentText: 'Today',
        monthNames: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ],
        monthNamesShort: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
        ],
        dayNames: [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
        ],
        dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        weekHeader: 'Wk',
        dateFormat: 'dd/mm/yy',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };

    protected firstReload: boolean;
    public filters: any;

    constructor(
        public messageService: MessageService,
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: AbstractService<T>,
        public path?: string,
        protected cdr?: ChangeDetectorRef
    ) {
    }

    ngOnInit() {
        this.service.buildSearch();
        this.firstReload = true;
    }

    public loaddata(firstReload: boolean, datatable: any) {
        this.preLoaddata();
        // console.log('loading data...', this.service.search);
        this.firstReload = firstReload;
        this.service.getList().subscribe(
            model => {
                this.model = <T[]>model;
                this.listSize = this.service.listSize;
                this.postList();
                this.cdr?.detectChanges();
            },
            error => (this.errorMessage = <any>error)
        );
    }

    public preLoaddata() {
    }

    public lazyLoad(event: any, datatable?: any) {
        // console.log('lazyLoad data...', this.service.search);
        if (!this.firstReload) {
            this.service._start = event.first;
        }
        this.service._limit = event.rows;
        // this.service.search.pageSize = event.rows;
        this.loaddata(this.firstReload, datatable);
        if (this.firstReload) {
            this.firstReload = false;
        }
    }


    public reload(datatable: any) {
        this.service._start = 0;
        datatable.reset();
        this.refresh(datatable);
    }

    public onSearchEnter(event: KeyboardEvent, datatable: any) {
        event.preventDefault();
        this.reload(datatable);
    }

    public refresh(datatable: any) {
        this.clearMsgs();
        datatable.reset();
    }

    public reset(datatable: any) {
        this.service.buildSearch();
        this.refresh(datatable);
    }

    public newElement(): T {
        throw new Error('override this');
    }

    public onRowSelect(event: T, focusable: any) {
        this.element = event;
        if (focusable) {
            focusable.focus();
        }
    }

    public getNavigateOnView() {
        return null;
    }

    public getNavigateOnEdit() {
        return null;
    }

    public postSave() {
    }

    public postUpdate() {
    }

    public postDelete() {
    }

    public save() {
        this.clearMsgs();
        this.service.persist(this.element).subscribe(
            element => {
                this.addInfo('Save completed successfully.');
                this.element = this.newElement();
                this.loaddata(false, null);
                this.postSave();
            },
            error => {
                this.addError(
                    'Unable to complete the save. Please try again.'
                );
            }
        );
    }

    public undo(focusable: any) {
        this.clearMsgs();
        this.element = this.newElement();
        if (focusable) {
            focusable.focus();
        }
    }

    public confirmDelete(element: T) {
        this.clearMsgs();
        if (!this.confirmationService) {
            return this.delete(element);
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
                this.delete(element);
            }
        });
    }


    public delete(element: T) {
        this.clearMsgs();
        this.service.delete(this.getId()).subscribe(
            result => {
                this.addInfo('Deletion completed successfully.');
                this.element = this.newElement();
                this.loaddata(false, null);
                this.postDelete();
            },
            error => {
                this.addError('Unable to complete the deletion.');
            }
        );
    }

    public update() {
        this.clearMsgs();
        this.service.update(this.element).subscribe(
            element => {
                this.addInfo('Update completed successfully.');
                this.element = this.newElement();
                this.loaddata(false, null);
                this.postUpdate();
            },
            error => {
                this.addError('Unable to complete the update.');
            }
        );
    }

    public postList() {
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

    public clearMsgs() {
        this.messageService.clear();
    }

    public view(element: T) {
        this.element = element;
        this.router.navigate(['/' + this.path + '/view', this.getId()]);
    }

    public edit(element: T) {
        this.element = element;
        this.router.navigate(['/' + this.path + '/edit', this.getId()]);
    }

    getId(): string {
        return String((this.element as unknown as { uuid: unknown }).uuid);
    }

    /*
      protected preLoad(event: LazyLoadEvent, datatable?: any) {
        if (event.sortField) {
          this.service.search.orderBy =
            event.sortField + (event.sortOrder > 0 ? ' ASC' : ' DESC');
        }
        this.manageFilters(event);
      }

      protected manageFilters(event: LazyLoadEvent) {
      }

      public resetAllFilters(table: Table) {
        if (table.filters) {
          this.filters = {
            nome: null
          };
          table.filters = {};
          table.onLazyLoad.emit(table.createLazyLoadMetadata());
        }
      }
      */
}
