import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {AiProjectContextService} from '../../services/ai-project-context.service';

/** Tab strip shared by the AI admin pages: one project's parts side by side, plus chat history. */
@Component({
    selector: 'ai-nav',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, RouterLinkActive],
    template: `
      <nav class="ai-nav">
        @for (tab of tabs; track tab.path) {
          <a [routerLink]="'/' + tab.path + '/list'" routerLinkActive="active">
            <i [class]="tab.icon" aria-hidden="true"></i> {{ tab.label }}
          </a>
        }
        @if (projectContext.activeUuid()) {
          <span class="ai-nav-project" title="New skills, tools, cards and service accounts go to this project">
            Project: <b>{{ projectContext.name(projectContext.activeUuid()) }}</b>
          </span>
        }
      </nav>
    `,
    styles: [`
      .ai-nav { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; margin-bottom: 12px; }
      .ai-nav a { padding: 6px 12px; border-radius: 4px; text-decoration: none; border: 1px solid transparent; }
      .ai-nav a.active { border-color: currentColor; font-weight: 600; }
      .ai-nav-project { margin-left: auto; opacity: .8; }
    `]
})
export class AiNavComponent {
    readonly projectContext = inject(AiProjectContextService);

    constructor() {
        this.projectContext.ensureLoaded();
    }

    readonly tabs = [
        {path: 'ai-projects', label: 'Projects', icon: 'fa-solid fa-diagram-project'},
        {path: 'ai-skills', label: 'Skills', icon: 'fa-solid fa-graduation-cap'},
        {path: 'ai-mcptools', label: 'MCP tools', icon: 'fa-solid fa-plug'},
        {path: 'ai-cards', label: 'Cards', icon: 'fa-solid fa-id-card'},
        {path: 'ai-serviceaccounts', label: 'Service accounts', icon: 'fa-solid fa-key'},
        {path: 'ai-history', label: 'Chat history', icon: 'fa-solid fa-comments'}
    ];
}
