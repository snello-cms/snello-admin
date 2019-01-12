import {Component} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {FieldDefinition} from "../../model/field-definition";
import {ApiService} from "../../service/api.service";

@Component(
  {
    templateUrl: "./form-generation-list.component.html",
    styleUrls: ["./form-generation-list.component.css"]
  }
)
export class FormGenerationListComponent {
  regConfig: FieldDefinition[] = [];
  metadataName: string;
  model: any[] = [];

  constructor(
    protected router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {

  }


  ngOnInit() {
    this.metadataName = this.route.snapshot.params['name'];
    this.regConfig = this.apiService.getDefinitions(this.metadataName);
    this.apiService.getList(this.metadataName).subscribe(
      model => {
        console.log(model);
        this.model = model;
      }
    );
  }

  dato(rowData: any, fieldDefinition: FieldDefinition): any {
    return rowData[fieldDefinition.name];
  }

  public edit(name: string,uuid: string) {
     this.router.navigate(['datalist/edit', name, uuid]);
  }
}

