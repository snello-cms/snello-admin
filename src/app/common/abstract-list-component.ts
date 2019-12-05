import {ConfirmationService, MessageService} from 'primeng/api';
import {AbstractService} from './abstract-service';
import {Router} from '@angular/router';
import {OnInit} from '@angular/core';
import {DocumentService} from '../service/document.service';

export abstract class AbstractListComponent<T> implements OnInit {

    element: T = null;
    errorMessage: string;
    model: T[] = [];
    listSize: number;
    public colspan = 3;

    public lang_it = {
        closeText: 'Chiudi',
        prevText: '&#x3C;Prec',
        nextText: 'Succ&#x3E;',
        currentText: 'Oggi',
        monthNames: [
            'Gennaio',
            'Febbraio',
            'Marzo',
            'Aprile',
            'Maggio',
            'Giugno',
            'Luglio',
            'Agosto',
            'Settembre',
            'Ottobre',
            'Novembre',
            'Dicembre'
        ],
        monthNamesShort: [
            'Gen',
            'Feb',
            'Mar',
            'Apr',
            'Mag',
            'Giu',
            'Lug',
            'Ago',
            'Set',
            'Ott',
            'Nov',
            'Dic'
        ],
        dayNames: [
            'Domenica',
            'Lunedì',
            'Martedì',
            'Mercoledì',
            'Giovedì',
            'Venerdì',
            'Sabato'
        ],
        dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
        dayNamesMin: ['Do', 'Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa'],
        weekHeader: 'Sm',
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
        public path?: string
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
                this.addInfo('Salvataggio completato con successo. ');
                this.element = this.newElement();
                this.loaddata(false, null);
                this.postSave();
            },
            error => {
                this.addError(
                    'Impossibile completare il salvataggio. Si prega di riprovare. '
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
            accept: () => {
                this.delete(element);
            }
        });
    }


    public delete(element: T) {
        this.clearMsgs();
        this.service.delete(this.getId()).subscribe(
            result => {
                this.addInfo('Eliminazione completata con successo. ');
                this.element = this.newElement();
                this.loaddata(false, null);
                this.postDelete();
            },
            error => {
                this.addError('Impossibile completare la eliminazione. ');
            }
        );
    }

    public update() {
        this.clearMsgs();
        this.service.update(this.element).subscribe(
            element => {
                this.addInfo('Modify completata con successo. ');
                this.element = this.newElement();
                this.loaddata(false, null);
                this.postUpdate();
            },
            error => {
                this.addError('Impossibile completare la Modify. ');
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

    getId() {
        return this.element['uuid'];
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
