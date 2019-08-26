import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AbstractService} from '../common/abstract-service';
import { MessageService } from 'primeng/api';
import { Droppable } from '../model/droppable';
import { DROPPABLE_API_PATH } from '../constants/constants';

@Injectable()
export class DroppableService extends AbstractService<Droppable> {

  constructor(protected http: HttpClient, messageService: MessageService) {
    super(DROPPABLE_API_PATH, http, messageService);
  }

  getId(element: Droppable) {
    return element.uuid;
  }

  buildSearch() {
    this.search = {
  
    };
  }
}


