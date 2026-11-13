import {Directive, inject, OnInit} from '@angular/core';
import {AbstractEditComponent} from './abstract-edit-component';
import {AiProjectContextService} from '../services/ai-project-context.service';

/** Edit page of a project-scoped AI resource: project picker, new rows default to the active project. */
@Directive()
export abstract class AbstractAiEditComponent<T extends { uuid: string; project_uuid: string }>
    extends AbstractEditComponent<T> implements OnInit {

    readonly projectContext = inject(AiProjectContextService);

    ngOnInit() {
        super.ngOnInit();
        this.projectContext.ensureLoaded();
    }

    postCreate() {
        this.element.project_uuid = this.projectContext.activeUuid();
        console.log('[ai-edit]', this.path, 'new row in project', this.element.project_uuid);
    }

    postFind() {
        console.log('[ai-edit]', this.path, 'loaded', this.element.uuid, 'project', this.element.project_uuid);
    }
}
