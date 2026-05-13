import {ChangeDetectorRef, Component, DestroyRef, OnInit, inject} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {MetadataService} from '../../services/metadata.service';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { HomepageTopBar } from '../homepage-topbar/homepage-topbar.component';

@Component({
    standalone: true,
    templateUrl: './homepage.component.html',
    imports: [SideBarComponent, HomepageTopBar, RouterLink]
})
export class HomepageComponent implements OnInit {
    readonly router = inject(Router);
    readonly metadatasService = inject(MetadataService);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly destroyRef = inject(DestroyRef);

    allModel: any[] = [];
    model: any[] = [];
    extensions: any[] = [];
    errorMessage: string;
    metadataGroups: string[] = [];
    selectedGroup: string | null = null;

    constructor() {
        this.allModel = [];
        this.model = [];
        this.extensions = [];
    }

    ngOnInit() {
        this.metadatasService.buildSearch();
        this.metadatasService.getAllList().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: model => {
                this.allModel = [];
                for (const element of model) {
                    if (element.created || element.already_exist) {
                        this.allModel.push(element);
                    }
                }
                const groupSet = new Set<string>(
                    this.allModel
                        .map(m => (m.metadata_group ?? '').trim())
                        .filter(Boolean)
                );
                this.metadataGroups = [...groupSet].sort((a, b) => a.localeCompare(b, 'it'));
                this.applyGroupFilter();
                this.cdr.detectChanges();
            },
            error: error => (this.errorMessage = <any>error)
        });
    }

    selectGroup(group: string | null) {
        this.selectedGroup = this.selectedGroup === group ? null : group;
        this.applyGroupFilter();
    }

    private applyGroupFilter() {
        if (!this.selectedGroup) {
            this.model = [...this.allModel];
        } else {
            this.model = this.allModel.filter(m => (m.metadata_group ?? '').trim() === this.selectedGroup);
        }
    }

}
