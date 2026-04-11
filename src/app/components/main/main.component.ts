3import {Component, ViewChild, inject} from '@angular/core';
import {DynamicFormComponent} from '../../generic.components/dynamic-form/dynamic-form.component';
import {APP_VERSION, ASSET_PATH} from '../../constants/constants';
import {ConfigurationService} from '../../service/configuration.service';
import {MessageService} from 'primeng/api';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
    templateUrl: './main.component.html',
    imports: [RouterLink, RouterOutlet]
})
export class MainComponent {
    private readonly configurationService = inject(ConfigurationService);
    private readonly messageService = inject(MessageService);

    @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

    public selected = 'home';
    public asset_path: string;

    constructor() {
        void this.messageService;
        this.configurationService.getValue(ASSET_PATH).subscribe({
            next: ass => {
                this.asset_path = ass;
            }
        });
    }

    public select(page: string) {
        this.selected = page;
    }

    version(): string {
        return APP_VERSION;
    }

}
