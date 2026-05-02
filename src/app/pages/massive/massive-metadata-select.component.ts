import {Component, OnInit, inject} from '@angular/core';
import {Router} from '@angular/router';
import {Metadata} from '../../models/metadata';
import {MetadataService} from '../../services/metadata.service';
import {ConfirmationService, MessageService, PrimeTemplate} from 'primeng/api';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {TableModule} from 'primeng/table';
import {DataListService} from '../../services/data-list.service';
import {catchError, map} from 'rxjs/operators';
import {forkJoin, of} from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-massive-metadata-select',
    templateUrl: './massive-metadata-select.component.html',
    styleUrls: ['./massive-metadata-select.component.scss'],
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, TableModule, PrimeTemplate]
})
export class MassiveMetadataSelectComponent extends AbstractListComponent<Metadata> implements OnInit {
    fieldCountByMetadata: Record<string, number> = {};
    private readonly dataListService = inject(DataListService);

    constructor() {
        super(inject(MessageService), inject(Router), inject(ConfirmationService), inject(MetadataService), 'metadata');
        this.filters = new Metadata();
    }

    ngOnInit() {
        this.service.buildSearch();
        this.firstReload = true;
    }

    override postList() {
        const requests = this.model
            .filter((metadata: Metadata) => !!metadata?.table_name)
            .map((metadata: Metadata) =>
                this.dataListService.getFieldDefinitionList(metadata.table_name).pipe(
                    map(fields => ({tableName: metadata.table_name, count: fields?.length || 0})),
                    catchError(() => of({tableName: metadata.table_name, count: 0}))
                )
            );

        if (requests.length === 0) {
            return;
        }

        forkJoin(requests).subscribe(results => {
            const nextMap: Record<string, number> = {};
            for (const result of results) {
                nextMap[result.tableName] = result.count;
            }
            this.fieldCountByMetadata = nextMap;
        });
    }

    getMetadataFieldCount(metadata: Metadata): number {
        const tableName = metadata?.table_name;
        if (tableName && this.fieldCountByMetadata[tableName] !== undefined) {
            return this.fieldCountByMetadata[tableName];
        }
        return metadata?.fields?.length || 0;
    }

    public selectMetadata(metadata: Metadata) {
        if (!metadata || !metadata.table_name) {
            this.messageService.add({
                severity: 'warning',
                summary: 'Please select a valid metadata.'
            });
            return;
        }
        this.router.navigate(['/massive/attributes', metadata.table_name]);
    }
}
