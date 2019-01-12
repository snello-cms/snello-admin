import {Component, ViewChild} from '@angular/core';
import {DynamicFormComponent} from './generic.components/dynamic-form/dynamic-form.component';
import {MetadataService} from './service/metadata.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

  constructor(private metadataService: MetadataService) {
  }

  public viewData(name: string, id: string) {
    this.metadataService.viewMetadata(name, id).subscribe(
      result => {
      }
    );
  }

  public editData(name: string, id: string) {
    this.metadataService.viewMetadata(name, id).subscribe(
      result => {
      }
    );
  }

  public newData(name: string) {
    this.metadataService.newMetadata(name).subscribe(
      result => {
      }
    );
  }
}
