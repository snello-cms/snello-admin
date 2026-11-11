import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractViewComponent} from '../../common/abstract-view-component';
import {ConfirmationService, MessageService} from 'primeng/api';
import {PrintTemplate} from '../../models/print-template';
import {PrintTemplateService} from '../../services/print-template.service';
import {showPrint} from '../../common/print-download.util';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';

@Component({
    standalone: true,
    templateUrl: './print-templates-view.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideBarComponent, AdminhomeTopBar]
})
export class PrintTemplatesViewComponent extends AbstractViewComponent<PrintTemplate> implements OnInit {

    constructor(
        router: Router,
        route: ActivatedRoute,
        public printTemplateService: PrintTemplateService,
        public confirmationService: ConfirmationService,
        protected messageService: MessageService
    ) {
        super(router, route, printTemplateService, messageService, 'printtemplates');
        this.element = new PrintTemplate();
    }

    createInstance(): PrintTemplate {
        return new PrintTemplate();
    }

    ngOnInit() {
        this.element = new PrintTemplate();
        super.ngOnInit();
    }

    getId(): string {
        return this.element.uuid;
    }

    public edit() {
        this.router.navigate(['/' + this.path + '/edit', this.getId()]);
    }

    print() {
        this.printTemplateService.print(this.element.name, '').subscribe({
            next: result => showPrint(result),
            error: (err: Error) => this.messageService.add({severity: 'error', summary: 'Print failed', detail: err.message})
        });
    }
}
