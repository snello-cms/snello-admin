import {Component, OnInit} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {FieldDefinitionService} from '../../service/field-definition.service';
import {MetadataService} from '../../service/metadata.service';
import {FieldDefinition, MAP_INPUT_TO_FIELD} from '../../model/field-definition';
import {ConfirmationService, SelectItem} from 'primeng/api';
import {map, switchMap} from 'rxjs/operators';
import {of} from 'rxjs';
import {Metadata} from "../../model/metadata";

@Component(
  {
    templateUrl: './field-definition-edit.component.html',
    styleUrls: ['./field-definition-edit.component.css']
  }
)
export class FieldDefinitionEditComponent extends AbstractEditComponent<FieldDefinition> implements OnInit {

  metadatas: Metadata[] = [];
  metadatasSelect: SelectItem[] = [];
  fieldType: string;
  public advanced: boolean = false;

  fieldTypes: SelectItem[] = [];

  mapFieldToType: Map<string, string> = new Map();
  mapMetadata: Map<string, Metadata> = new Map();

  tabs: SelectItem[] = [];
  groups: SelectItem[] = [];

  tabToGroups: Map<string, SelectItem[]> = new Map();
  searchConditionItems: SelectItem[] = [
    {label: "equals", value: ""},
    {label: "not equals", value: "ne"},
    {label: "less than", value: "lt"},
    {label: "greater than", value: "gt"},
    {label: "less or equal", value: "lte"},
    {label: "greater or equal", value: "gte"},
    {label: "contains", value: "contains"},
    {label: "contanins case insensitve", value: "containss"}];

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public confirmationService: ConfirmationService,
    public fieldDefinitionService: FieldDefinitionService,
    public metadataService: MetadataService
  ) {
    super(router, route, confirmationService, fieldDefinitionService, 'fielddefinition');
    for (const key of Array.from(MAP_INPUT_TO_FIELD.keys())) {
      this.fieldTypes.push({value: key, label: key});
      this.mapFieldToType.set(MAP_INPUT_TO_FIELD.get(key)[0] + MAP_INPUT_TO_FIELD.get(key)[1], key)
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
          this.valorizeMetadatas(metadataList);
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
      ),
      switchMap(
        () => {
          return this.route.queryParamMap;
        }
      ),
      map(
        (params: Params) => {
          if (params && params.get('metadata_uuid')) {
            this.element.metadata_uuid = params.get('metadata_uuid');
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

  valorizeMetadatas(metadataList: Metadata[]) {
    this.metadatas = metadataList;
    for (let i = 0; i < this.metadatas.length; i++) {
      if (!this.metadatas[i].created) {
        this.metadatasSelect.push({value: this.metadatas[i].uuid, label: this.metadatas[i].table_name});
        this.mapMetadata.set(this.metadatas[i].uuid, this.metadatas[i]);
      }
    }
  }

  preSave(): boolean {

    this.pre();
    if (this.element.searchable) {
      this.element.search_field_name = this.element.search_condition == "" ? this.element.name : this.element.name + "_" + this.element.search_condition;
    }
    return super.preSave();
  }


  preUpdate(): boolean {
    this.pre();
    if (this.element.searchable) {
      this.element.search_field_name = this.element.search_condition == "" ? this.element.name : this.element.name + "_" + this.element.search_condition;
    }
    return super.preUpdate();
  }

  pre() {
    let fieldDefTypes = MAP_INPUT_TO_FIELD.get(this.fieldType);
    this.element.metadata_name = this.mapMetadata.get(this.element.metadata_uuid).table_name;
    this.element.type = fieldDefTypes[0];
    this.element.inputType = fieldDefTypes[1];
    delete this.element.value;
    delete this.element.is_edit;
  }

  createInstance(): FieldDefinition {
    return new FieldDefinition();
  }

  postFind() {
    if (!this.element.inputType) {
      this.element.inputType = null;
    }
    this.fieldType = this.mapFieldToType.get(this.element.type + this.element.inputType);
    super.postFind();
  }

  changedMetadata(event: any) {
    this.element.tab_name = null;
    this.element.group_name = null;
    this.tabs = [];
    this.groups = [];
    let meta = this.mapMetadata.get(event.value);

    //Se la stringa contine un ";": ho sicuramente la divisione in tab. Splitto tutto, tiro fuori i tab e valuto le sottostringhe
    if (!meta.tab_groups) {
      return;
    }
    if (meta.tab_groups.includes(";")) {
      let tabsAndGroups = meta.tab_groups.split(";");
      for (let singleTabAndGroups of tabsAndGroups) {
        this.splitTabsAndGroups(singleTabAndGroups);
      }

    }

    //Se la stringa non contine ";" ma solo "," ho una divisione in gruppi
    if (!meta.tab_groups.includes(";") && meta.tab_groups.includes(",")) {
      let grouped = meta.tab_groups.split(",");
      for (let group of grouped) {
        this.groups.push({label: group, value: group});
      }
    }
  }

  changedTab(event: any) {
    this.element.group_name = null;
    this.groups = this.tabToGroups.get(event.value);
  }

  private splitTabsAndGroups(singleTabAndGroups: string) {
    let splittedTabGroups = singleTabAndGroups.split(":");
    //1)tab1:group1,group2
    //2)tab2
    if (!this.tabs) {
      this.tabs = [];
    }
    this.tabs.push({label: splittedTabGroups[0], value: splittedTabGroups[0]});
    if (splittedTabGroups.length > 1) {
      //caso tab1:group1,group2
      let groups = splittedTabGroups[1].split(",");
      let selectItemArray: SelectItem[] = [];
      for (let group of groups) {
        selectItemArray.push({label: group, value: group});
      }
      this.tabToGroups.set(splittedTabGroups[0], selectItemArray);
    }
  }

  next(uuid: string) {
    this.clearMsgs();
    this.editMode = false;
    this.preSave()
    this.service.persist(this.element).subscribe(
      element => {
        this.addInfo('Salvataggio completato con successo. ');
        this.element = element;
        this.element = this.createInstance();
        this.element.metadata_uuid = uuid;
        this.fieldType = null;
        this.postCreate();

      },
      error => {
        this.addError(
          'Impossibile completare il salvataggio. ' + (error || '')
        );
        this.saveError();
      }
    );

  }
}

