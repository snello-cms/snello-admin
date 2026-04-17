import {Component, DestroyRef, ViewChild, inject} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {DynamicFormComponent} from '../../generic.components/dynamic-form/dynamic-form.component';
import {APP_VERSION, ASSET_PATH} from '../../constants/constants';
import {ConfigurationService} from '../../services/configuration.service';
import {MessageService} from 'primeng/api';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
    standalone: true,
    templateUrl: './main.component.html',
    imports: [RouterLink, RouterOutlet]
})
export class MainComponent {
    private readonly configurationService = inject(ConfigurationService);
    private readonly messageService = inject(MessageService);
    private readonly destroyRef = inject(DestroyRef);

    @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

    public selected = 'home';
    public asset_path: string;

    constructor() {
        void this.messageService;
        this.configurationService.getValue(ASSET_PATH).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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

    resolveAssetUrl(relativePath: string): string {
        const path = relativePath.replace(/^\/+/, '');
        const basePath = (this.asset_path ?? '').trim();

        if (!basePath) {
            return path;
        }

        const normalizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
        return `${normalizedBase}/${path}`;
    }

}
