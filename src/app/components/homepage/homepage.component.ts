import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DataListService} from '../../service/data-list.service';
import {ApiService} from '../../service/api.service';
import {MetadataService} from '../../service/metadata.service';
import {Metadata} from '../../model/metadata';

@Component(
    {
        templateUrl: './homepage.component.html',
        styleUrls: ['./homepage.component.css']
    }
)
export class HomepageComponent implements OnInit {

    model: any[] = [];
    errorMessage: string;


    constructor(private _route: ActivatedRoute,
                public router: Router,
                public metadatasService: MetadataService,
                public dataListService: DataListService,
                private apiService: ApiService) {
        this.model = [];
    }

    ngOnInit() {
        this.metadatasService.buildSearch();
        this.metadatasService.getList().subscribe(
            model => {
                this.model = <Metadata[]>model;
            },
            error => (this.errorMessage = <any>error)
        );
    }

}
