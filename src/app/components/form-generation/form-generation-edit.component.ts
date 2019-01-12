import {Component, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {DataListService} from "../../service/data-list.service";
import {FieldDefinition} from "../../model/field-definition";
import {DynamicFormComponent} from "../../generic.components/dynamic-form/dynamic-form.component";
import {ApiService} from "../../service/api.service";

@Component(
  {
    templateUrl: "./form-generation-edit.component.html",
    styleUrls: ["./form-generation-edit.component.css"]
  }
)
export class FormGenerationEditComponent {

  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

  regConfig: FieldDefinition[] = [];
  errorMessage: string;
  metadataName: string;
  uuid: string;
  constructor(
    protected router: Router,
    private route: ActivatedRoute,
    public dataListService: DataListService,
    private apiService: ApiService
  ) {

  }

  ngOnInit() {
    this.metadataName = this.route.snapshot.params['name'];
    this.uuid = this.route.snapshot.params['uuid'];
    this.regConfig = this.apiService.getDefinitions(this.metadataName);
    if (this.uuid) {
      this.apiService.fetch(this.metadataName, this.uuid).subscribe(
        element => {
          for (let definition_1 of this.regConfig) {
            if(element.hasOwnProperty(definition_1.name)) {
              definition_1.value = element[definition_1.name];
            }
          }
        }
      );
    }

  }

  save() {
    this.apiService.persist(this.metadataName, this.form.value)
      .subscribe(
        element => {
          if (element) {
            console.log("record saved : " + element);
          }
        }
      );
  }

  update() {
    this.apiService.update(this.metadataName, this.uuid, this.form.value)
      .subscribe(
        element => {
          if (element) {
            console.log("record saved : " + element);
            this.router.navigate(['datalist/list', this.metadataName]);
          }
        }
      );
  }

  cancel () {
    this.router.navigate(['datalist/list', this.metadataName]);
  }
}

