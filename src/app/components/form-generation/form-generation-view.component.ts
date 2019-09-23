import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Data, Router} from '@angular/router';
import {FieldDefinition} from '../../model/field-definition';
import {DynamicFormComponent} from '../../generic.components/dynamic-form/dynamic-form.component';
import {Observable} from 'rxjs';

@Component(
    {
        templateUrl: './form-generation-view.component.html',
        styleUrls: ['./form-generation-view.component.css']
    }
)
export class FormGenerationViewComponent implements OnInit {

    @ViewChild(DynamicFormComponent, {static: false}) form: DynamicFormComponent;

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
            .subscribe((data: { fieldDefinitionValorized: FieldDefinition[] }) => {
                this.regConfig = data.fieldDefinitionValorized;
            });
    }

    cancel() {
        this.router.navigate(['datalist/list', this.metadataName]);
    }
}
