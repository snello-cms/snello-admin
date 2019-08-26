import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Condition} from '../model/condtion';
import {CONDITION_API_PATH, DRAGGABLE_API_PATH} from '../constants/constants';
import {AbstractService} from '../common/abstract-service';
import { MessageService } from 'primeng/api';
import { Draggable } from '../model/draggable';

@Injectable()
export class DraggableService extends AbstractService<Draggable> {

  constructor(protected http: HttpClient, messageService: MessageService) {
    super(DRAGGABLE_API_PATH, http, messageService);
  }

  getId(element: Draggable) {
    return element.uuid;
  }

  buildSearch() {
    this.search = {
  
    };
  }
}


