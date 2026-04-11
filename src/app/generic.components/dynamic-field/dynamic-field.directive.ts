import {Directive, Input, OnInit, Type, ViewContainerRef} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
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
import { RealtionshipsComponent } from '../realtionships/realtionships.component';
import { RealtionshipsViewComponent } from '../realtionships/realtionships-view.component';

@Directive({ selector: '[dynamicField]' })
export class DynamicFieldDirective implements OnInit {
    @Input() field!: FieldDefinition;
    @Input() group!: UntypedFormGroup;
    @Input() view = false;

    constructor(private container: ViewContainerRef) {}

    componentRef: any;

    async ngOnInit() {
        let componentType: Type<any> | undefined;

        if (!this.view && this.field.type === 'tinymce') {
            componentType = (await import('../tinymce/tinymce.component')).TinymceComponent;
        } else if (!this.view && this.field.type === 'monaco') {
            componentType = (await import('../monaco/monaco.component')).MonacoComponent;
        } else {
            componentType = this.view
                ? componentViewMapper[this.field.type]
                : componentMapper[this.field.type];
        }

        if (!componentType) {
            return;
        }

        this.componentRef = this.container.createComponent(componentType);
        this.componentRef.instance.field = this.field;
        this.componentRef.instance.group = this.group;
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
    realtionships: RealtionshipsComponent,
    media: MediaComponent,
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
    realtionships: RealtionshipsViewComponent,
    media: MediaViewComponent,
    gmaplocation: GMapLocationViewComponent,
    gmappath: GMapPathViewComponent
};
