import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Router} from '@angular/router';
import {PrintTemplate} from '../../models/print-template';
import {PrintTemplateService} from '../../services/print-template.service';
import {showPrint} from '../../common/print-download.util';
import {ConfirmationService, MessageService, PrimeTemplate, SelectItem} from 'primeng/api';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {SelectModule} from 'primeng/select';
import {TableModule} from 'primeng/table';

@Component({
    standalone: true,
    templateUrl: './print-templates-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, SelectModule, TableModule,
        PrimeTemplate]
})
export class PrintTemplatesListComponent extends AbstractListComponent<PrintTemplate> implements OnInit {

    typeItems: SelectItem[] = [
        {label: '', value: ''},
        {label: 'PDF', value: 'pdf'},
        {label: 'HTML', value: 'html'},
        {label: 'CSV', value: 'csv'},
        {label: 'XLSX', value: 'xlsx'}
    ];

    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: PrintTemplateService,
        public messageService: MessageService
    ) {
        super(messageService, router, confirmationService, service, 'printtemplates');
        this.filters = new PrintTemplate();
    }

    ngOnInit() {
        this.service.buildSearch();
        this.firstReload = true;
    }

    public new() {
        this.router.navigate(['/' + this.path + '/new']);
    }

    print(row: PrintTemplate) {
        this.service.print(row.name, '').subscribe({
            next: result => {
                showPrint(result);
                this.messageService.add({severity: 'success', summary: `${row.name}: ${result.rows ?? '?'} row(s)`});
            },
            error: (err: Error) => this.messageService.add({severity: 'error', summary: 'Print failed', detail: err.message})
        });
    }
}
