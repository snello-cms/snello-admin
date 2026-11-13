import {Directive, inject, OnInit} from '@angular/core';
import {AbstractListComponent} from './abstract-list-component';
import {AiProjectContextService} from '../services/ai-project-context.service';

/** List of a project-scoped AI resource: filter by project, defaulting to the active one. */
@Directive()
export abstract class AbstractAiListComponent<T extends { uuid: string; project_uuid: string }>
    extends AbstractListComponent<T> implements OnInit {

    readonly projectContext = inject(AiProjectContextService);

    ngOnInit() {
        super.ngOnInit();
        this.projectContext.ensureLoaded();
    }

    /** A concrete project also becomes the active one, so "Add" creates rows there. */
    onProjectChange(uuid: string, datatable: any) {
        console.log('[ai-list]', this.path, 'project filter ->', uuid || 'all');
        this.projectContext.select(uuid);
        this.reload(datatable);
    }

    public new() {
        this.router.navigate(['/' + this.path + '/new']);
    }

    projectName(uuid: string): string {
        return this.projectContext.name(uuid);
    }
}
