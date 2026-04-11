import {Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SnelloChatWidgetComponent } from './components/snello-chat-widget/snello-chat-widget.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [RouterOutlet, SnelloChatWidgetComponent]
})
export class AppComponent {
}
