import {Component, ChangeDetectionStrategy} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SnelloChatWidgetComponent } from './pages/snello-chat-widget/snello-chat-widget.component';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterOutlet, SnelloChatWidgetComponent]
})
export class AppComponent {
}
