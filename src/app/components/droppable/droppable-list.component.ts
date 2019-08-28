import { OnInit } from '@angular/core';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {MetadataService} from '../../service/metadata.service';
import { ConfirmationService } from 'primeng/api';
import { Draggable } from 'src/app/model/draggable';
import {DroppableService} from '../../service/droppable.service';
import {Droppable} from '../../model/droppable';

@Component(
  {
    templateUrl: './droppable-list.component.html',
    styleUrls: ['./droppable-list.component.css']
  }
)
export class DroppableListComponent extends AbstractListComponent<Droppable> implements OnInit {



  constructor(
      public router: Router,
      public confirmationService: ConfirmationService,
      public droppableService: DroppableService,
      public metadataService: MetadataService) {

    super(router, confirmationService, droppableService, 'droppables');
    this.filters = new Draggable();
     }

  ngOnInit() {
    this.service.buildSearch();
    this.firstReload = true;
  }

  public new() {
    this.router.navigate(['/' + this.path + '/new']);
  }

  postList() {
    super.postList();
  }
}

