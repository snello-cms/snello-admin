import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {PrintTemplate} from '../../models/print-template';
import {PrintTemplateService} from '../../services/print-template.service';
import {showPrint} from '../../common/print-download.util';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SelectModule} from 'primeng/select';
import {InputText} from 'primeng/inputtext';
import {Textarea} from 'primeng/textarea';
import {DialogModule} from 'primeng/dialog';
import {ToggleSwitchModule} from 'primeng/toggleswitch';

@Component({
    standalone: true,
    templateUrl: './print-templates-edit.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, SelectModule, InputText, Textarea,
        DialogModule, ToggleSwitchModule]
})
export class PrintTemplatesEditComponent extends AbstractEditComponent<PrintTemplate> implements OnInit {

    showLegendDialog = false;
    testQuery = '';
    printing = false;

    typeItems: SelectItem[] = [
        {label: 'PDF (HTML body → PDF)', value: 'pdf'},
        {label: 'HTML', value: 'html'},
        {label: 'CSV (empty body = every column)', value: 'csv'},
        {label: 'XLSX (JXLS template file)', value: 'xlsx'}
    ];

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        public confirmationService: ConfirmationService,
        public printTemplateService: PrintTemplateService,
        public messageService: MessageService
    ) {
        super(router, route, confirmationService, printTemplateService, messageService, 'printtemplates');
    }

    ngOnInit() {
        this.element = new PrintTemplate();
        super.ngOnInit();
    }

    createInstance(): PrintTemplate {
        return new PrintTemplate();
    }

    get needsBody(): boolean {
        return this.element.export_type === 'pdf' || this.element.export_type === 'html';
    }

    get usesBody(): boolean {
        return this.element.export_type !== 'xlsx';
    }

    /** Reads the chosen .xlsx as base64 into template_file (stored in the row, so it travels with export/import). */
    onTemplateFile(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) {
            return;
        }
        console.log('[print-templates] template file', file.name, file.size);
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = String(reader.result);
            this.element.template_file = dataUrl.substring(dataUrl.indexOf(',') + 1);
            this.element.template_file_name = file.name;
        };
        reader.onerror = () => this.addError('Unable to read ' + file.name);
        reader.readAsDataURL(file);
    }

    downloadTemplateFile() {
        if (!this.element.template_file) {
            return;
        }
        const bytes = Uint8Array.from(atob(this.element.template_file), c => c.charCodeAt(0));
        const blob = new Blob([bytes], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
        showPrint({blob, fileName: this.element.template_file_name || 'template.xlsx', rows: null});
    }

    testPrint() {
        if (!this.element.name) {
            return;
        }
        this.printing = true;
        this.printTemplateService.print(this.element.name, this.testQuery).subscribe({
            next: result => {
                this.printing = false;
                showPrint(result);
                this.addInfo(`Printed ${result.rows ?? '?'} row(s).`);
            },
            error: (err: Error) => {
                this.printing = false;
                this.addError('Print failed. ' + err.message);
            }
        });
    }

    get printUrl(): string {
        return '/api/printtemplates/' + (this.element.name || '{name}') + '/print' + (this.testQuery ? '?' + this.testQuery : '');
    }
}
