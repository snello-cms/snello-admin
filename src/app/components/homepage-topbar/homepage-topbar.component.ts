import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DataListService} from '../../service/data-list.service';
import {ApiService} from '../../service/api.service';
import {MetadataService} from '../../service/metadata.service';
import {Metadata} from '../../model/metadata';

@Component({
    selector: 'homepage-topbar',
    templateUrl: './homepage-topbar.html'
})
export class HomepageTopBar {
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
        this.metadatasService.getListSearch({}, 0, 100).subscribe(
            model => {
                this.model = <Metadata[]>model;
            },
            error => (this.errorMessage = <any>error)
        );
    }
}
