import {Component, OnInit, inject} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {DataListService} from '../../service/data-list.service';
import {ApiService} from '../../service/api.service';
import {MetadataService} from '../../service/metadata.service';
import {Metadata} from '../../model/metadata';

@Component({
    selector: 'homepage-topbar',
    templateUrl: './homepage-topbar.component.html',
    imports: [RouterLink]
})
export class HomepageTopBar implements OnInit{
    private readonly route = inject(ActivatedRoute);
    readonly router = inject(Router);
    readonly metadatasService = inject(MetadataService);
    readonly dataListService = inject(DataListService);
    private readonly apiService = inject(ApiService);

    model: any[] = [];
    errorMessage: string;

    constructor() {
        this.model = [];
    }

    ngOnInit(): void {
        void this.route;
        void this.apiService;
        this.metadatasService.getListSearch({}, 0, 100).subscribe({
            next: model => {
                this.model = <Metadata[]>model;
            },
            error: error => (this.errorMessage = <any>error)
        });
    }
}
