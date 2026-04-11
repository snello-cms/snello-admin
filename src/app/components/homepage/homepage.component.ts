import {ChangeDetectorRef, Component, OnInit, inject} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {MetadataService} from '../../service/metadata.service';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { HomepageTopBar } from '../homepage-topbar/homepage-topbar.component';

@Component({
    templateUrl: './homepage.component.html',
    imports: [SideBarComponent, HomepageTopBar, RouterLink]
})
export class HomepageComponent implements OnInit {
    readonly router = inject(Router);
    readonly metadatasService = inject(MetadataService);
    private readonly cdr = inject(ChangeDetectorRef);

    model: any[] = [];
    extensions: any[] = [];
    errorMessage: string;

    constructor() {
        this.model = [];
        this.extensions = [];
    }

    ngOnInit() {
        this.metadatasService.buildSearch();
        this.metadatasService.getAllList().subscribe({
            next: model => {
                this.model = [];
                for (const element of model) {
                    if (element.created || element.already_exist) {
                        this.model.push(element);
                    }
                }
                this.cdr.detectChanges();
            },
            error: error => (this.errorMessage = <any>error)
        });
    }

}
