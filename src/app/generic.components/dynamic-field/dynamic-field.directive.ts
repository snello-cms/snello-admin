import {ComponentFactoryResolver, Directive, Input, OnInit, ViewContainerRef} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import {InputComponent} from '../input/input.component';
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
import {TinymceComponent} from '../tinymce/tinymce.component';
import {MonacoComponent} from '../monaco/monaco.component';
import {InputViewComponent} from '../input/input-view.component';
import {HtmlViewComponent} from '../input/html-view.component';
import { JoinViewComponent } from '../join/join-view.component';
import { MultiJoinViewComponent } from '../multi-join/multi-join-view.component';
import { MediaViewComponent } from '../media/media-view.component';

@Directive({
    selector: '[dynamicField]'
})
export class DynamicFieldDirective implements OnInit {
    @Input() field: FieldDefinition;
    @Input() group: FormGroup;
    @Input() view: boolean;

    constructor(
        private resolver: ComponentFactoryResolver,
        private container: ViewContainerRef
    ) {
    }

    componentRef: any;

    ngOnInit() {

        let factory;
        if (!this.view) {
            factory = this.resolver.resolveComponentFactory(
                componentMapper[this.field.type]
            );
        }
        if (this.view) {
            factory = this.resolver.resolveComponentFactory(
                componentVewMapper[this.field.type]
            );
        }
        this.componentRef = this.container.createComponent(factory);
        this.componentRef.instance.field = this.field;
        this.componentRef.instance.group = this.group;
    }
}


const componentMapper = {
    input: InputComponent,
    select: SelectComponent,
    date: DateComponent,
    datetime: DatetimeComponent,
    time: TimeComponent,
    checkbox: CheckboxComponent,
    textarea: TextAreaComponent,
    tinymce: TinymceComponent,
    monaco: MonacoComponent,
    tags: TagComponent,
    join: JoinComponent,
    multijoin: MultiJoinComponent,
    media: MediaComponent
};

const componentVewMapper = {
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
    media: MediaViewComponent
};
