import {Directive, OnInit, Type, ViewContainerRef, inject, input} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {FieldDefinition} from '../../models/field-definition';
import {InputComponent} from '../input/input.component';
import { GMapLocationComponent } from '../gmaplocation/gmaplocation.component';
import { GMapPathComponent } from '../gmappath/gmappath.component';
import {SelectComponent} from '../select/select.component';
import {DateComponent} from '../date/date.component';
import {CheckboxComponent} from '../checkbox/checkbox.component';
import {TextAreaComponent} from '../textarea/textarea.component';
import {TagComponent} from '../tag/tag.component';
import {DatetimeComponent} from '../datetime/datetime.component';
import {JoinComponent} from '../join/join.component';
import {TimeComponent} from '../time/time.component';
import {MultiJoinComponent} from '../multi-join/multi-join.component';
import {MediaComponent} from '../media/media.component';
import {InputViewComponent} from '../input/input-view.component';
import {HtmlViewComponent} from '../input/html-view.component';
import { GMapLocationViewComponent } from '../gmaplocation/gmaplocation-view.component';
import { GMapPathViewComponent } from '../gmappath/gmappath-view.component';
import { JoinViewComponent } from '../join/join-view.component';
import { MultiJoinViewComponent } from '../multi-join/multi-join-view.component';
import { MediaViewComponent } from '../media/media-view.component';
import { ImageComponent } from '../image/image.component';
import { ImageViewComponent } from '../image/image-view.component';

@Directive({ selector: '[dynamicField]' })
export class DynamicFieldDirective implements OnInit {
    field = input.required<FieldDefinition>();
    group = input.required<UntypedFormGroup>();
    view = input(false);

    private container = inject(ViewContainerRef);

    componentRef: any;

    async ngOnInit() {
        let componentType: Type<any> | undefined;

        if (!this.view() && this.field().type === 'tinymce') {
            componentType = (await import('../tinymce/tinymce.component')).TinymceComponent;
        } else if (!this.view() && this.field().type === 'monaco') {
            componentType = (await import('../monaco/monaco.component')).MonacoComponent;
        } else if (!this.view() && this.field().type === 'realtionships') {
            componentType = (await import('../realtionships/realtionships.component')).RealtionshipsComponent;
        } else if (this.view() && this.field().type === 'realtionships') {
            componentType = (await import('../realtionships/realtionships-view.component')).RealtionshipsViewComponent;
        } else {
            componentType = this.view()
                ? componentViewMapper[this.field().type]
                : componentMapper[this.field().type];
        }

        if (!componentType) {
            return;
        }

        this.componentRef = this.container.createComponent(componentType);
        this.componentRef.instance.field = this.field();
        this.componentRef.instance.group = this.group();
    }
}

const componentMapper: Record<string, Type<any>> = {
    input: InputComponent,
    select: SelectComponent,
    date: DateComponent,
    datetime: DatetimeComponent,
    time: TimeComponent,
    checkbox: CheckboxComponent,
    textarea: TextAreaComponent,
    tags: TagComponent,
    join: JoinComponent,
    multijoin: MultiJoinComponent,
    media: MediaComponent,
    image: ImageComponent,
    gmaplocation: GMapLocationComponent,
    gmappath: GMapPathComponent
};

const componentViewMapper: Record<string, Type<any>> = {
    input: InputViewComponent,
    select: InputViewComponent,
    date: InputViewComponent,
    datetime: InputViewComponent,
    time: InputViewComponent,
    checkbox: CheckboxComponent,
    textarea: InputViewComponent,
    tinymce: HtmlViewComponent,
    ace9: HtmlViewComponent,
    tags: InputViewComponent,
    join: JoinViewComponent,
    multijoin: MultiJoinViewComponent,
    media: MediaViewComponent,
    image: ImageViewComponent,
    gmaplocation: GMapLocationViewComponent,
    gmappath: GMapPathViewComponent
};
