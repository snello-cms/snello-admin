import {Component, ViewChild} from '@angular/core';
import {DynamicFormComponent} from "../../generic.components/dynamic-form/dynamic-form.component";
import {APP_VERSION} from "../../../constants";

@Component({
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {

  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

  selected: string = "home";

  constructor() {
  }

  public select(page: string) {
    this.selected = page;
  }

  version(): string {
    return APP_VERSION;
  }

}
