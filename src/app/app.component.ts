import {Component, OnInit} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [RouterOutlet]
})
export class AppComponent  {
    constructor(private router: Router) {
    }

    

}
