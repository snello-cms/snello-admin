import {AbstractListComponent} from '../../common/abstract-list-component';
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Document} from '../../model/document';
import {DocumentService} from '../../service/document.service';
import { ConfirmationService, MessageService, PrimeTemplate, SelectItem } from 'primeng/api';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { AdminhomeTopBar } from '../adminhome-topbar/adminhome-topbar.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { CopyClipboardDirective } from '../../directives/copy-clipboard.directive';

@Component({
    templateUrl: './document-list.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, TableModule, MultiSelectModule, PrimeTemplate, CopyClipboardDirective]
})
export class DocumentListComponent extends AbstractListComponent<Document> implements OnInit {


    uuid: string;
    selectedMimeTypes: string[] = [];
    readonly mimeTypeOptions: SelectItem[] = [
        { label: 'JPG', value: 'image/jpeg' },
        { label: 'PNG', value: 'image/png' },
        { label: 'GIF', value: 'image/gif' },
        { label: 'WEBP', value: 'image/webp' },
        { label: 'SVG', value: 'image/svg+xml' },
        { label: 'BMP', value: 'image/bmp' },
        { label: 'TIFF', value: 'image/tiff' },
        { label: 'PDF', value: 'application/pdf' }
    ];


    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: DocumentService,
        public messageService: MessageService) {

        super(messageService, router, confirmationService, service, 'document');
        this.filters = new Document();
    }

    ngOnInit() {
        this.service.buildSearch();
        this.firstReload = true;
    }

    public new() {
        this.router.navigate(['/' + this.path + '/new']);
    }

    override reload(datatable: any) {
        this.applyMimeTypeFilter();
        super.reload(datatable);
    }

    override reset(datatable: any) {
        this.selectedMimeTypes = [];
        if (this.service.search) {
            delete this.service.search.mimetype_in;
        }
        super.reset(datatable);
    }

    postList() {
        super.postList();
    }

    applyMimeTypeFilter(event?: { value?: Array<string | number | SelectItem> }) {
        if (!this.service.search) {
            return;
        }

        const rawValues = Array.isArray(event?.value) ? event.value : this.selectedMimeTypes;
        const normalizedValues = rawValues
            .map(value => this.normalizeMimeTypeValue(value))
            .filter((value): value is string => Boolean(value));

        this.selectedMimeTypes = normalizedValues;

        if (normalizedValues.length > 0) {
            this.service.search.mimetype_in = normalizedValues.join(',');
        } else {
            delete this.service.search.mimetype_in;
        }
    }

    private normalizeMimeTypeValue(value: string | number | SelectItem | undefined): string | null {
        if (typeof value === 'string') {
            return value;
        }

        if (typeof value === 'number') {
            const optionValue = this.mimeTypeOptions[value]?.value;
            return typeof optionValue === 'string' ? optionValue : null;
        }

        if (value && typeof value === 'object') {
            const optionValue = value.value;
            return typeof optionValue === 'string' ? optionValue : null;
        }

        return null;
    }

    download(uuid: string): void {
        this.service.simplDownload(uuid).subscribe(response => {

            // It is necessary to create a new blob object with mime-type explicitly set
            // otherwise only Chrome works like it should
            const newBlob = new Blob([(response)], {type: 'application/octet-stream'});

            // IE doesn't allow using a blob object directly as link href
            // instead it is necessary to use msSaveOrOpenBlob
            const nav = window.navigator as Navigator & { msSaveOrOpenBlob?: (blob: Blob) => void };
            if (nav.msSaveOrOpenBlob) {
                nav.msSaveOrOpenBlob(newBlob);
                return;
            }

            // For other browsers:
            // Create a link pointing to the ObjectURL containing the blob.
            const downloadURL = URL.createObjectURL(response);
            window.open(downloadURL);
        });
    }

    downloadPath(uuid: string) {
        return this.service.downloadPath(uuid);
    }

    public notify(info: string) {
        const dwl =
            // Might want to notify the user that something has been pushed to the clipboard
            this.messageService.add({
                severity: 'info',
                summary: `'${info}' has been copied to clipboard`
            });
    }

    delete(element: Document) {
        this.clearMsgs();
        this.service.delete(element.uuid).subscribe(
            result => {
                this.addInfo('Deletion completed successfully.');
                this.loaddata(false, null);
            },
            error => {
                this.addError('Unable to complete the deletion.');
            }
        );
    }
}
