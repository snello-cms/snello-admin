import {Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SnelloChatWidgetComponent } from './pages/snello-chat-widget/snello-chat-widget.component';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    imports: [RouterOutlet, SnelloChatWidgetComponent]
})
export class AppComponent {
}
