import {Component, OnInit, inject} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FieldDefinition} from '../../models/field-definition';
import {FieldDefinitionService} from '../../services/field-definition.service';
import {MetadataService} from '../../services/metadata.service';
import {Metadata} from '../../models/metadata';
import {MessageService} from 'primeng/api';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-massive-attributes-select',
    templateUrl: './massive-attributes-select.component.html',
    styleUrls: ['./massive-attributes-select.component.scss'],
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, CommonModule]
})
export class MassiveAttributesSelectComponent implements OnInit {

    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly fieldDefinitionService = inject(FieldDefinitionService);
    private readonly metadataService = inject(MetadataService);
    private readonly messageService = inject(MessageService);

    metadataName: string;
    metadata: Metadata;
    fieldDefinitions: FieldDefinition[] = [];
    selectedFields: FieldDefinition[] = [];
    isLoading = false;

    ngOnInit() {
        this.metadataName = this.route.snapshot.params['name'];

        if (!this.metadataName) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Metadata name not provided'
            });
            this.router.navigate(['/massive/metadata']);
            return;
        }

        this.route.data.subscribe(
            (data: any) => {
                this.fieldDefinitions = data?.fieldDefinitionValorized ?? [];
                this.selectedFields = [];
            }
        );

        // Load metadata
        this.metadataService.buildSearch();
        this.metadataService._start = 0;
        this.metadataService._limit = 1;
        this.metadataService.search = new Metadata();
        this.metadataService.search.table_name = this.metadataName;
        this.metadataService.getList().subscribe(
            metadata => {
                if (metadata && metadata.length > 0) {
                    this.metadata = metadata[0];
                }
            },
            err => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load metadata'
                });
            }
        );
    }

    onFieldToggle(field: FieldDefinition) {
        const index = this.selectedFields.indexOf(field);
        if (index >= 0) {
            this.selectedFields.splice(index, 1);
        } else {
            this.selectedFields.push(field);
        }
    }

    isFieldSelected(field: FieldDefinition): boolean {
        return this.selectedFields.includes(field);
    }

    proceedToEdit() {
        if (this.selectedFields.length === 0) {
            this.messageService.add({
                severity: 'warning',
                summary: 'Please select at least one attribute.'
            });
            return;
        }

        // Save selected field UUIDs to sessionStorage for retrieval in edit component
        const selectedFieldUuids = this.selectedFields.map(f => f.uuid);
        sessionStorage.setItem(`massive_selected_fields_${this.metadataName}`, JSON.stringify(selectedFieldUuids));

        // Pass selected fields via navigation state
        this.router.navigate(['/massive/edit', this.metadataName], {
            state: {selectedFields: this.selectedFields}
        });
    }

    goBack() {
        this.router.navigate(['/massive/metadata']);
    }
}
