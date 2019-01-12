import {Component} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {FieldDefinitionService} from '../../service/field-definition.service';
import {MetadataService} from '../../service/metadata.service';
import {FieldDefinition, MAP_INPUT_TO_FIELD} from '../../model/field-definition';
import {SelectItem} from 'primeng/api';
import {map, switchMap} from 'rxjs/operators';
import {of} from 'rxjs';

@Component(
  {
    templateUrl: './field-definition-edit.component.html',
    styleUrls: ['./field-definition-edit.component.css']
  }
)
export class FieldDefinitionEditComponent extends AbstractEditComponent<FieldDefinition> {

  metadatas = [];
  metadatasSelect: SelectItem[] = [];
  fieldType: string;

  fieldTypes: SelectItem[] = [
  ];

  mapFieldToType: Map<string, string> = new Map();
  mapMetadata: Map<string, string> = new Map();

  constructor(
    router: Router,
    route: ActivatedRoute,
    private fieldDefinitionService: FieldDefinitionService,
    private metadataService: MetadataService
  ) {
    super(router, route, fieldDefinitionService, 'fielddefinition');
    for(const key of Array.from( MAP_INPUT_TO_FIELD.keys()) ) {
      this.fieldTypes.push({value: key, label: key});
      this.mapFieldToType.set(MAP_INPUT_TO_FIELD.get(key)[0]+ MAP_INPUT_TO_FIELD.get(key)[1], key)
    }
  }


  ngOnInit() {
    this.metadatas = [];
    this.metadatasSelect = [];
    this.element = new FieldDefinition();

    const id: string = this.route.snapshot.params['id'];

    this.metadataService.getList().pipe(
      map(
        metadataList => {
          this.metadatas = metadataList;
          for (let i = 0; i < this.metadatas.length; i++) {
            this.metadatasSelect.push({value: this.metadatas[i].uuid, label: this.metadatas[i].table_name});
            this.mapMetadata.set(this.metadatas[i].uuid, this.metadatas[i].table_name);
          }
          return metadataList;
        }
      ),
      switchMap(
        () => {
          if (id) {
            return this.service.find(id);
          }
          return of(null);
        }
      ),
      map(
        element => {
          if (element) {
            this.element = <FieldDefinition>element;
            this.postFind();
          } else {
            this.editMode = false;
            this.element = this.createInstance();
            this.postCreate();
          }

        }
      )
    ).subscribe(
      () => {
        console.log(this.element);
      },
      error => {
        this.addError('Errore nel caricamento dei dati.' + (error || ''));
      });


  }

  preSave(): boolean {
    const fieldDefTypes = MAP_INPUT_TO_FIELD.get(this.fieldType);
    this.element.metadata_name =  this.mapMetadata.get(this.element.metadata_uuid);
    this.element.type = fieldDefTypes[0];
    this.element.inputType = fieldDefTypes[1];
    delete this.element.value;
    return super.preSave();
  }


  preUpdate(): boolean {
    const fieldDefTypes = MAP_INPUT_TO_FIELD.get(this.fieldType);
    this.element.metadata_name =  this.mapMetadata.get(this.element.metadata_uuid);
    this.element.type = fieldDefTypes[0];
    this.element.inputType = fieldDefTypes[1];
    delete this.element.value;
    return super.preUpdate();
  }

  createInstance(): FieldDefinition {
    return new FieldDefinition();
  }


  postFind() {
    if (!this.element.inputType) {
      this.element.inputType = null;
    }
    this.fieldType = this.mapFieldToType.get(this.element.type+this.element.inputType);
    super.postFind();
  }
}

