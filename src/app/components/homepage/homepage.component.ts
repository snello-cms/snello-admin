import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {DataListService} from '../../service/data-list.service';
import {ApiService} from '../../service/api.service';
import {MetadataService} from '../../service/metadata.service';
import {Metadata} from '../../model/metadata';
import {ExtensionService} from '../../service/extension.service';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { HomepageTopBar } from '../homepage-topbar/homepage-topbar.component';

@Component({
    templateUrl: './homepage.component.html',
    imports: [SideBarComponent, HomepageTopBar, RouterLink]
})
export class HomepageComponent implements OnInit {

    model: any[] = [];
    extensions: any[] = [];
    errorMessage: string;


    constructor(private _route: ActivatedRoute,
                public router: Router,
                public metadatasService: MetadataService,
                private apiService: ApiService,
                private cdr: ChangeDetectorRef) {
        this.model = [];
        this.extensions = [];
    }

    ngOnInit() {
        this.metadatasService.buildSearch();
        this.metadatasService.getAllList().subscribe(
            model => {
                this.model = [];
                for (const element of model) {
                    if (element.created || element.already_exist) {
                        this.model.push(element);
                    }
                }
                this.cdr.detectChanges();
            },
            error => (this.errorMessage = <any>error)
        );
    }

}
