import { OnInit } from '@angular/core';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {MetadataService} from '../../service/metadata.service';
import { ConfirmationService } from 'primeng/api';
import { Draggable } from 'src/app/model/draggable';
import { DraggableService } from 'src/app/service/draggable.service';

@Component(
  {
    templateUrl: './draggable-list.component.html',
    styleUrls: ['./draggable-list.component.css']
  }
)
export class DraggableListComponent extends AbstractListComponent<Draggable> implements OnInit {



  constructor(
      public router: Router,
      public confirmationService: ConfirmationService,
      public draggableService: DraggableService,
      public metadataService: MetadataService) {

    super(router, confirmationService, draggableService, 'draggables');
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

