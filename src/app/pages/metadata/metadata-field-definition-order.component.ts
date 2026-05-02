import {Component, OnInit, inject} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {forkJoin} from 'rxjs';
import {ButtonModule} from 'primeng/button';
import {MessageService} from 'primeng/api';
import {OrderListModule} from 'primeng/orderlist';
import {Metadata} from '../../models/metadata';
import {FieldDefinition} from '../../models/field-definition';
import {MetadataService} from '../../services/metadata.service';
import {FieldDefinitionService} from '../../services/field-definition.service';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';

@Component({
    standalone: true,
    templateUrl: './metadata-field-definition-order.component.html',
    styleUrl: './metadata-field-definition-order.component.scss',
    imports: [CommonModule, SideBarComponent, AdminhomeTopBar, OrderListModule, ButtonModule]
})
export class MetadataFieldDefinitionOrderComponent implements OnInit {

    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly metadataService = inject(MetadataService);
    private readonly fieldDefinitionService = inject(FieldDefinitionService);
    private readonly messageService = inject(MessageService);

    metadata = new Metadata();
    fieldDefinitions: FieldDefinition[] = [];
    selectedFieldDefinitions: FieldDefinition[] = [];
    loading = false;
    saving = false;
    private savedOrderByUuid: Record<string, number> = {};

    ngOnInit() {
        const metadataId = this.route.snapshot.params['id'];
        if (!metadataId) {
            this.router.navigate(['/metadata/list']);
            return;
        }

        this.loading = true;
        this.metadataService.find(metadataId).subscribe({
            next: metadata => {
                this.metadata = metadata;
                this.loadFieldDefinitions();
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    onReorder() {
        this.applyOrderNumbers();
    }

    getSavedOrder(fieldDefinition: FieldDefinition): number | null {
        if (!fieldDefinition.uuid) {
            return null;
        }
        return this.savedOrderByUuid[fieldDefinition.uuid] ?? null;
    }

    hasOrderChanged(fieldDefinition: FieldDefinition): boolean {
        const savedOrder = this.getSavedOrder(fieldDefinition);
        return savedOrder != null && savedOrder !== (fieldDefinition.order_num ?? null);
    }

    save() {
        if (this.saving || this.fieldDefinitions.length === 0) {
            return;
        }

        this.applyOrderNumbers();
        this.saving = true;

        forkJoin(this.fieldDefinitions.map(fieldDefinition => this.fieldDefinitionService.update(fieldDefinition))).subscribe({
            next: updatedFieldDefinitions => {
                this.fieldDefinitions = [...updatedFieldDefinitions].sort((a, b) => (a.order_num ?? 0) - (b.order_num ?? 0));
                this.syncSavedOrderPreview(this.fieldDefinitions);
                this.selectedFieldDefinitions = [];
                this.saving = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Order updated',
                    detail: 'Field definitions order saved successfully.'
                });
            },
            error: () => {
                this.saving = false;
            }
        });
    }

    back() {
        this.router.navigate(['/metadata/view', this.metadata.uuid]);
    }

    private loadFieldDefinitions() {
        this.fieldDefinitionService.buildSearch();
        this.fieldDefinitionService.search.metadata_uuid = this.metadata.uuid;
        this.fieldDefinitionService.getAllList().subscribe({
            next: fieldDefinitions => {
                this.fieldDefinitions = [...fieldDefinitions].sort((a, b) => (a.order_num ?? 0) - (b.order_num ?? 0));
                this.applyOrderNumbers();
                this.syncSavedOrderPreview(this.fieldDefinitions);
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    private applyOrderNumbers() {
        this.fieldDefinitions = this.fieldDefinitions.map((fieldDefinition, index) => ({
            ...fieldDefinition,
            order_num: index + 1
        }));
    }

    private syncSavedOrderPreview(fieldDefinitions: FieldDefinition[]) {
        this.savedOrderByUuid = fieldDefinitions.reduce((accumulator, fieldDefinition) => {
            if (fieldDefinition.uuid) {
                accumulator[fieldDefinition.uuid] = fieldDefinition.order_num ?? 0;
            }
            return accumulator;
        }, {} as Record<string, number>);
    }
}