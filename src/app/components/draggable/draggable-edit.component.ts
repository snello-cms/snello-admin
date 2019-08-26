import {Component, OnInit} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {Condition} from '../../model/condtion';
import {ConditionService} from '../../service/condition.service';
import {MetadataService} from '../../service/metadata.service';
import {Metadata} from '../../model/metadata';
import {ConfirmationService, SelectItem} from 'primeng/api';
import { Draggable } from 'src/app/model/draggable';
import { DraggableService } from 'src/app/service/draggable.service';

@Component(
  {
    templateUrl: './draggable-edit.component.html',
    styleUrls: ['./draggable-edit.component.css']
  }
)
export class DraggableEditComponent extends AbstractEditComponent<Draggable> implements OnInit {

  metadatas = [];
  metadatasSelect: SelectItem[] =[];
  mapMetadata: Map<string, Metadata> = new Map();

  constructor(
      public router: Router,
      public route: ActivatedRoute,
      public confirmationService: ConfirmationService,
      public theService: DraggableService,
      public metadataService: MetadataService
  ) {
    super(router, route, confirmationService, theService, 'draggable');

  }

  ngOnInit() {
    this.element = new Draggable();
   
    super.ngOnInit();
  }


  createInstance(): Draggable {
    return new Draggable();
  }

}

