import {Component, OnInit} from '@angular/core';
import {Metadata} from '../../model/metadata';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import {MetadataService} from '../../service/metadata.service';
import {AbstractViewComponent} from '../../common/abstract-view-component';
import {FieldDefinitionService} from '../../service/field-definition.service';
import {FieldDefinition} from '../../model/field-definition';

@Component({
    templateUrl: './metadata-view.component.html',
    styleUrls: ['./metadata-view.component.css']
})
export class MetadataViewComponent extends AbstractViewComponent<Metadata>
    implements OnInit {

    public fieldDefinitions: FieldDefinition[];
    public colspan = 3;

    constructor(
        router: Router,
        route: ActivatedRoute,
        public metadataService: MetadataService,
        public fieldDefinitionService: FieldDefinitionService
    ) {
        super(router, route, metadataService, 'metadata');
        this.element = new Metadata();
    }

    createInstance(): Metadata {
        return new Metadata();
    }

    ngOnInit() {
        this.element = new Metadata();
        super.ngOnInit();
    }

    getId() {
        return this.element.uuid;
    }

    postFind() {
        super.postFind();
        this.fieldDefinitionService.buildSearch();
        this.fieldDefinitionService.search.metadata_uuid = this.element.uuid;
        this.fieldDefinitionService.getAllList().subscribe(
            fieldDefinitions => {
                this.fieldDefinitions = fieldDefinitions;
            });
    }


    public editField(fieldDefinition: FieldDefinition) {
        const navigationExtras: NavigationExtras = {
            queryParams: {
                'pageBack': '/' + this.path + '/view',
                'uuidBack': this.element.uuid
            }
        };
        this.router.navigate(['/fielddefinition/edit', fieldDefinition.uuid], navigationExtras);
    }

    newFieldDefinition() {
        const navigationExtras: NavigationExtras = {
            queryParams: {
                'metadata_uuid': this.element.uuid,
                'pageBack': '/' + this.path + '/view',
                'uuidBack': this.element.uuid
            }
        };
        this.router.navigate(['/fielddefinition/new'], navigationExtras);
    }

}
