import {Component, OnInit} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {Metadata} from '../../model/metadata';
import {ActivatedRoute, Router} from '@angular/router';
import {MetadataService} from '../../service/metadata.service';
import {ConfirmationService, SelectItem} from 'primeng/api';
import {FONT_AWESOME_ICONS} from "../../../constants";

@Component({
  templateUrl: './metadata-edit.component.html',
  styleUrls: ['./metadata-edit.component.css']
})
export class MetadataEditComponent extends AbstractEditComponent<Metadata>
  implements OnInit {

  tableTypeSelect: SelectItem[] = [
    { value: 'uuid', label: 'uuid' },
    { value: 'slug', label: 'slug' },
    {value: 'autoincrement', label: 'auto increment' }
  ];

  public newtable: boolean = true;
  public advanced: boolean = false;

  constructor(
    router: Router,
    route: ActivatedRoute,
    confirmationService: ConfirmationService,
    metadataService: MetadataService
  ) {
    super(router, route, confirmationService, metadataService, 'metadata');
  }

  iconItems: SelectItem[] = FONT_AWESOME_ICONS;

  createInstance(): Metadata {
    return new Metadata();
  }


  postCreate() {
    this.element.icon = FONT_AWESOME_ICONS[0].value;
    super.postCreate();
  }

  ngOnInit() {
    this.element = new Metadata();
    super.ngOnInit();
    if (this.element.uuid) {
      this.newtable = this.element.already_exist;
    }
  }

  preSave(): boolean {
    this.element.already_exist = !this.newtable;
    return true;
  }

  preUpdate(): boolean {
    this.element.already_exist = !this.newtable;
    return true;
  }


}
