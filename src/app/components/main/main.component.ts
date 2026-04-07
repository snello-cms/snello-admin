import {Component, ViewChild} from '@angular/core';
import {DynamicFormComponent} from '../../generic.components/dynamic-form/dynamic-form.component';
import {APP_VERSION, ASSET_PATH} from '../../constants/constants';
import {ConfigurationService} from '../../service/configuration.service';
import {MessageService} from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
    templateUrl: './main.component.html',
    imports: [MessagesModule, RouterLink, RouterOutlet]
})
export class MainComponent {

    @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

    public selected = 'home';
    public asset_path: string;

    constructor(private configurationService: ConfigurationService,
                private messageService: MessageService) {
        configurationService.getValue(ASSET_PATH).subscribe(
            ass => this.asset_path = ass
        );
    }

    public select(page: string) {
        this.selected = page;
    }

    version(): string {
        return APP_VERSION;
    }

}
