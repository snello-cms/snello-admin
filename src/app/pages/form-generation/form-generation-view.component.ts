import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FieldDefinition} from '../../models/field-definition';
import {DynamicFormComponent} from '../../generic.components/dynamic-form/dynamic-form.component';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { HomepageTopBar } from '../homepage-topbar/homepage-topbar.component';

@Component({
    standalone: true,
    templateUrl: './form-generation-view.component.html',
    imports: [SideBarComponent, HomepageTopBar, DynamicFormComponent]
})
export class FormGenerationViewComponent implements OnInit {

    @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

    regConfig: FieldDefinition[] = [];
    errorMessage: string;
    metadataName: string;
    uuid: string;

    constructor(
        protected router: Router,
        private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.metadataName = this.route.snapshot.params['name'];
        this.uuid = this.route.snapshot.params['uuid'];
        this.regConfig = [];
        this.route.data
            .subscribe((data: unknown) => {
                const resolved = (data as { fieldDefinitionValorized?: FieldDefinition[] })?.fieldDefinitionValorized;
                this.regConfig = resolved ?? [];
            });
    }

    cancel() {
        this.router.navigate(['datalist/list', this.metadataName]);
    }

     galleria() {
        this.router.navigate(['/document/new'], { queryParams: { table_key: this.uuid, table_name: this.metadataName} });
    }

    public edit() {
        this.router.navigate(['datalist/edit', this.metadataName, this.uuid]);
    }

    public clone() {
        this.router.navigate(['datalist/new', this.metadataName], {
            queryParams: { clone_uuid: this.uuid }
        });
    }
}
