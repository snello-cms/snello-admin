import {Component, OnInit} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';
import {Link} from '../../model/link';
import {LinksService} from '../../service/links.service';
import {MetadataService} from '../../service/metadata.service';
import {map, switchMap} from 'rxjs/operators';
import {Metadata} from '../../model/metadata';
import {DataListService} from '../../service/data-list.service';
import {Observable} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component(
    {
        templateUrl: './links-edit.component.html',
        styleUrls: ['./links-edit.component.css']
    }
)
export class LinksEditComponent extends AbstractEditComponent<Link> implements OnInit {

    public metadatas: SelectItem[] = [];
    public fieldDefinitions: SelectItem[] = [];
    public mapMetadata: Map<string, Metadata> = new Map();

    registerForm: FormGroup;

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        public confirmationService: ConfirmationService,
        public metadataService: MetadataService,
        public userService: LinksService,
        private formBuilder: FormBuilder,
        public messageService: MessageService,
        public dataListService: DataListService) {
        super(router, route, confirmationService, userService, messageService, 'links');

    }

    ngOnInit() {
        this.element = new Link();
        this.buildForm();
        super.ngOnInit();
    }

    createInstance(): Link {
        return new Link();

    }

    getId() {
        return this.element.name;
    }

    postFind() {
        this.element.uuid_name = this.element.name;
        this.metadataService.getList().pipe(
            map(
                metadatas => {
                    let selectedMetadata: Metadata = null;
                    if (metadatas && metadatas.length > 0) {
                        for (const metadata of metadatas) {
                            this.metadatas.push({label: metadata.table_name, value: metadata.table_name});
                            this.mapMetadata.set(metadata.table_name, metadata);
                            if (this.element.metadata_name === metadata.table_name) {
                                selectedMetadata = metadata;
                            }
                        }
                    }
                    return selectedMetadata;
                }
            ),
            switchMap(
                selectedMetadata => {
                    return this.loadFieldDefinitions(selectedMetadata.table_name);
                }
            )
        ).subscribe(
            () => {
                this.buildForm();
            }
        );
    }

    postCreate() {
        this.metadataService.getList().pipe(
            map(
                metadatas => {
                    const selectedMetadata: Metadata = null;
                    if (metadatas && metadatas.length > 0) {
                        for (const metadata of metadatas) {
                            this.metadatas.push({label: metadata.table_name, value: metadata.table_name});
                            this.mapMetadata.set(metadata.table_name, metadata);
                        }
                    }
                    return selectedMetadata;
                }
            )
        ).subscribe();
    }

    public loadFieldDefinitions(metadataName: string): Observable<any> {
        return this.dataListService.getFieldDefinitionList(metadataName).pipe(
            map(
                fieldDefinitionList => {
                    this.fieldDefinitions = [];
                    for (const definition of fieldDefinitionList) {
                        this.fieldDefinitions.push({label: definition.name, value: definition.name});
                    }
                    return true;
                }
            )
        );
    }

    preUpdate(): boolean {
        delete this.element.uuid_name;
        return true;
    }

    changedMetadata(event: any) {
        const meta = this.mapMetadata.get(event.value);
        this.element.metadata_name = meta.table_name;
        this.element.metadata_key = meta.table_key;
        this.loadFieldDefinitions(meta.table_name).subscribe();
    }

    private buildForm() {

        this.registerForm = this.formBuilder.group({
            name: [this.element.name, Validators.required],
            labels: [this.element.labels, Validators.required],
            metadata_name: [this.element.metadata_name, Validators.required],
            metadata_lock_field: [this.element.metadata_lock_field],
            metadata_searchable_field: [this.element.metadata_searchable_field]
        });
    }
}

