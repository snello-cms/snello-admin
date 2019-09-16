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

@Directive({
  selector: '[dynamicField]'
})
export class DynamicFieldDirective implements OnInit {
  @Input() field: FieldDefinition;
  @Input() group: FormGroup;

  constructor(
    private resolver: ComponentFactoryResolver,
    private container: ViewContainerRef
  ) {
  }

  componentRef: any;

  ngOnInit() {

    const factory = this.resolver.resolveComponentFactory(
      componentMapper[this.field.type]
    );
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
  tags: TagComponent,
  join: JoinComponent,
  multijoin: MultiJoinComponent,
  media: MediaComponent
};

