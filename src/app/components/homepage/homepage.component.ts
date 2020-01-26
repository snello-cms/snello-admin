import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DataListService} from '../../service/data-list.service';
import {ApiService} from '../../service/api.service';
import {MetadataService} from '../../service/metadata.service';
import {Metadata} from '../../model/metadata';
import {ExtensionService} from '../../service/extension.service';

@Component(
    {
        templateUrl: './homepage.component.html',
        styleUrls: ['./homepage.component.css']
    }
)
export class HomepageComponent implements OnInit {

    model: any[] = [];
    extensions: any[] = [];
    errorMessage: string;


    constructor(private _route: ActivatedRoute,
                public router: Router,
                public metadatasService: MetadataService,
                private extensionService: ExtensionService,
                private apiService: ApiService) {
        this.model = [];
        this.extensions = [];
    }

    ngOnInit() {
        this.metadatasService.buildSearch();
        this.metadatasService.getList().subscribe(
            model => {
                this.model = [];
                for (const element of model) {
                    if (element.created || element.already_exist) {
                        this.model.push(element);
                    }
                }
            },
            error => (this.errorMessage = <any>error)
        );
        this.extensionService.search._sort = 'name asc';
        this.extensionService.getAllList().subscribe(
            list => this.extensions = list
        );
    }

}
