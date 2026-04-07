import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {DataListService} from '../../service/data-list.service';
import {ApiService} from '../../service/api.service';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { HomepageTopBar } from '../homepage-topbar/homepage-topbar.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';

@Component({
    templateUrl: './form-generation-metadata-list.component.html',
    imports: [SideBarComponent, HomepageTopBar, ReactiveFormsModule, FormsModule, TableModule, PrimeTemplate]
})
export class FormGenerationMetadataListComponent implements OnInit {

    model: string [] = [];
    listSize = 0;
    errorMessage: string;

    constructor(
        protected router: Router,
        public dataListService: DataListService,
        private apiService: ApiService) {
    }

    public loaddata(firstReload: boolean) {
        this.preLoaddata();
        this.dataListService.getMetadataNames().subscribe(
            model => {
                this.model = <string[]>model;
                this.listSize = this.model.length;
                this.postList();
            },
            error => (this.errorMessage = <any>error)
        );
    }

    public preLoaddata() {
    }

    postList() {
    }

    ngOnInit() {
    }

    public toList(name: string) {
        this.router.navigate(['datalist/list', name]);
    }

    public toForm(name: string) {
        this.router.navigate(['datalist/new', name]);
    }
}
